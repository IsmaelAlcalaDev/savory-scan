
-- 1) Deduplicar: conservar 1 fila por (user_id, restaurant_id), priorizando activa y más reciente
WITH ranked AS (
  SELECT
    id,
    user_id,
    restaurant_id,
    is_active,
    saved_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, restaurant_id
      ORDER BY is_active DESC, saved_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.user_saved_restaurants
),
to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.user_saved_restaurants
WHERE id IN (SELECT id FROM to_delete);

-- 2) Restricción de unicidad firme
ALTER TABLE public.user_saved_restaurants
  ADD CONSTRAINT user_saved_restaurants_unique_user_restaurant
  UNIQUE (user_id, restaurant_id);

-- 3) Endurecer la función RPC: impedir suplantación de user_id
--    Mantiene la firma usada por el frontend pero valida contra auth.uid()
CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite(
  user_id_param uuid,
  restaurant_id_param integer
) RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
BEGIN
  -- Validación de identidad: el cliente no puede actuar por otro usuario
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF user_id_param IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Verificar estado actual
  SELECT is_active
    INTO is_currently_saved
  FROM public.user_saved_restaurants
  WHERE user_id = auth.uid() AND restaurant_id = restaurant_id_param;

  IF is_currently_saved IS NULL THEN
    -- No existe, crear nuevo favorito (activo)
    INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, is_active, saved_at, saved_from)
    VALUES (auth.uid(), restaurant_id_param, true, CURRENT_TIMESTAMP, 'toggle');
    RETURN true;
  ELSIF is_currently_saved = false THEN
    -- Existe pero inactivo, reactivar y actualizar saved_at
    UPDATE public.user_saved_restaurants
    SET is_active = true,
        saved_at = CURRENT_TIMESTAMP,
        unsaved_at = NULL
    WHERE user_id = auth.uid() AND restaurant_id = restaurant_id_param;
    RETURN true;
  ELSE
    -- Está activo, desactivar
    UPDATE public.user_saved_restaurants
    SET is_active = false,
        unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid() AND restaurant_id = restaurant_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- 4) RLS estricto en user_saved_restaurants
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas (idempotente)
DROP POLICY IF EXISTS "usr_select_own_or_admin" ON public.user_saved_restaurants;
DROP POLICY IF EXISTS "usr_insert_own" ON public.user_saved_restaurants;
DROP POLICY IF EXISTS "usr_update_own_or_admin" ON public.user_saved_restaurants;
DROP POLICY IF EXISTS "usr_delete_own_or_admin" ON public.user_saved_restaurants;

-- Ver: usuario ve lo suyo o admin ve todo
CREATE POLICY "usr_select_own_or_admin"
  ON public.user_saved_restaurants
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Insert: el usuario solo puede crear lo suyo (admin también)
CREATE POLICY "usr_insert_own"
  ON public.user_saved_restaurants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Update: usuario/administrador pueden actualizar
CREATE POLICY "usr_update_own_or_admin"
  ON public.user_saved_restaurants
  FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Delete: usuario/administrador pueden borrar
CREATE POLICY "usr_delete_own_or_admin"
  ON public.user_saved_restaurants
  FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- 5) Índice para acelerar comprobaciones de ventana y consultas
CREATE INDEX IF NOT EXISTS idx_usr_user_restaurant_savedat
  ON public.user_saved_restaurants (user_id, restaurant_id, saved_at DESC);

-- 6) Realtime robusto
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.user_saved_restaurants;

-- 7) Asegurar trigger de contadores (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_update_favorites_counters_usr'
  ) THEN
    CREATE TRIGGER trg_update_favorites_counters_usr
    AFTER INSERT OR UPDATE ON public.user_saved_restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_favorites_counters();
  END IF;
END$$;

-- 8) Recalcular contadores para corregir cualquier desvío histórico
SELECT public.recalculate_favorites_counters();
