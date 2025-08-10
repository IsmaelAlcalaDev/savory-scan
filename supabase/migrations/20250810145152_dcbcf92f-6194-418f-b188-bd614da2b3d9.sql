
-- 1) Claves primarias, relaciones y RLS

-- Asegurar PK en public.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_pkey'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- Asegurar PK en public.user_auth_providers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_auth_providers_pkey'
  ) THEN
    ALTER TABLE public.user_auth_providers
    ADD CONSTRAINT user_auth_providers_pkey PRIMARY KEY (id);
  END IF;
END$$;

-- FK desde user_auth_providers a users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_auth_providers_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_auth_providers
    ADD CONSTRAINT user_auth_providers_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Unicidad (user_id, provider)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_auth_providers_user_provider_unique'
  ) THEN
    ALTER TABLE public.user_auth_providers
    ADD CONSTRAINT user_auth_providers_user_provider_unique
    UNIQUE (user_id, provider);
  END IF;
END$$;

-- Unicidad parcial por proveedor + id externo (cuando exista)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'user_auth_providers_provider_uid_unique'
  ) THEN
    CREATE UNIQUE INDEX user_auth_providers_provider_uid_unique
      ON public.user_auth_providers(provider, provider_user_id)
      WHERE provider_user_id IS NOT NULL;
  END IF;
END$$;

-- Índice auxiliar por user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'idx_user_auth_providers_user_id'
  ) THEN
    CREATE INDEX idx_user_auth_providers_user_id
      ON public.user_auth_providers(user_id);
  END IF;
END$$;

-- Habilitar RLS donde falta
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth_providers ENABLE ROW LEVEL SECURITY;

-- Políticas para public.users
DO $$
BEGIN
  -- Limpiar políticas previas con el mismo nombre para evitar duplicados
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own user row') THEN
    DROP POLICY "Users can view own user row" ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own user row') THEN
    DROP POLICY "Users can update own user row" ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can view all users') THEN
    DROP POLICY "Admins can view all users" ON public.users;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can update all users') THEN
    DROP POLICY "Admins can update all users" ON public.users;
  END IF;
END$$;

CREATE POLICY "Users can view own user row"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own user row"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Políticas para public.user_auth_providers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own auth providers') THEN
    DROP POLICY "Users can view own auth providers" ON public.user_auth_providers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can create own auth provider') THEN
    DROP POLICY "Users can create own auth provider" ON public.user_auth_providers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update own auth provider') THEN
    DROP POLICY "Users can update own auth provider" ON public.user_auth_providers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can delete own auth provider') THEN
    DROP POLICY "Users can delete own auth provider" ON public.user_auth_providers;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can view all auth providers') THEN
    DROP POLICY "Admins can view all auth providers" ON public.user_auth_providers;
  END IF;
END$$;

CREATE POLICY "Users can view own auth providers"
  ON public.user_auth_providers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own auth provider"
  ON public.user_auth_providers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own auth provider"
  ON public.user_auth_providers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own auth provider"
  ON public.user_auth_providers FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all auth providers"
  ON public.user_auth_providers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- 2) Ajustar profiles para la UI actual
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text;

-- Insert policy para robustness (en caso de que el trigger tarde en crearla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'Users can create own profile'
  ) THEN
    CREATE POLICY "Users can create own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

-- 3) Añadir preferencias en users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 4) Auto-creación de users/profiles/roles en nuevos registros de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create users (tabla principal de app) con el mismo id que auth.users
  INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Crear el trigger (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END$$;

-- 5) Backfill para usuarios ya existentes (idempotente)
INSERT INTO public.users (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.raw_user_meta_data->>'avatar_url',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = u.id
);

INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id
);

-- 6) RPC para registrar proveedor de autenticación y actualizar métricas de login
CREATE OR REPLACE FUNCTION public.upsert_user_auth_provider(
  p_provider public.auth_provider,
  p_provider_user_id text DEFAULT NULL,
  p_provider_email text DEFAULT NULL,
  p_provider_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Garantizar que exista la fila en users (por si viene de una migración antigua)
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (auth.uid(), p_provider_email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT (id) DO NOTHING;

  -- Upsert del proveedor
  INSERT INTO public.user_auth_providers (id, user_id, provider, provider_user_id, provider_email, provider_data, created_at)
  VALUES (
    extensions.uuid_generate_v4(),
    auth.uid(),
    p_provider,
    p_provider_user_id,
    p_provider_email,
    COALESCE(p_provider_data, '{}'::jsonb),
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (user_id, provider)
  DO UPDATE SET
    provider_user_id = EXCLUDED.provider_user_id,
    provider_email   = EXCLUDED.provider_email,
    provider_data    = EXCLUDED.provider_data;

  -- Actualizar métricas de login
  UPDATE public.users
  SET 
    last_login_at = CURRENT_TIMESTAMP,
    login_count   = COALESCE(login_count, 0) + 1,
    updated_at    = CURRENT_TIMESTAMP
  WHERE id = auth.uid();
END;
$function$;
