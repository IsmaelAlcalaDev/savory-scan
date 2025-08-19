
-- 1) RLS y políticas en user_saved_restaurants
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_saved_restaurants' AND polname = 'usr can select own saved restaurants') THEN
    DROP POLICY "usr can select own saved restaurants" ON public.user_saved_restaurants;
  END IF;
END$$;

CREATE POLICY "usr can select own saved restaurants"
  ON public.user_saved_restaurants
  FOR SELECT
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_saved_restaurants' AND polname = 'usr can insert own saved restaurants') THEN
    DROP POLICY "usr can insert own saved restaurants" ON public.user_saved_restaurants;
  END IF;
END$$;

CREATE POLICY "usr can insert own saved restaurants"
  ON public.user_saved_restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_saved_restaurants' AND polname = 'usr can update own saved restaurants') THEN
    DROP POLICY "usr can update own saved restaurants" ON public.user_saved_restaurants;
  END IF;
END$$;

CREATE POLICY "usr can update own saved restaurants"
  ON public.user_saved_restaurants
  FOR UPDATE
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_saved_restaurants' AND polname = 'usr can delete own saved restaurants') THEN
    DROP POLICY "usr can delete own saved restaurants" ON public.user_saved_restaurants;
  END IF;
END$$;

CREATE POLICY "usr can delete own saved restaurants"
  ON public.user_saved_restaurants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Realtime más robusto en updates (opcional pero recomendado)
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;

-- 2) Trigger de actualización de contadores
DROP TRIGGER IF EXISTS trg_update_favorites_counters ON public.user_saved_restaurants;

CREATE TRIGGER trg_update_favorites_counters
AFTER INSERT OR UPDATE ON public.user_saved_restaurants
FOR EACH ROW EXECUTE FUNCTION public.update_favorites_counters();

-- 3) Permisos y policy para actualizar solo contadores en restaurants

-- Conceder UPDATE únicamente a las columnas de contadores
GRANT UPDATE (favorites_count, favorites_count_week, favorites_count_month)
ON public.restaurants TO authenticated;

-- Policy de UPDATE para usuarios autenticados (combinada con GRANT limita los campos)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'restaurants' AND polname = 'allow authenticated to update counters') THEN
    DROP POLICY "allow authenticated to update counters" ON public.restaurants;
  END IF;
END$$;

CREATE POLICY "allow authenticated to update counters"
  ON public.restaurants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
