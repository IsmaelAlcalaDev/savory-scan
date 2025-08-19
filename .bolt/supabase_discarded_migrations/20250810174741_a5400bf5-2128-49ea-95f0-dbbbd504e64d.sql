
-- 1) Elevar privilegios de funciones de trigger para que puedan actualizar restaurants pese a RLS
ALTER FUNCTION public.update_favorites_counters() SECURITY DEFINER;
ALTER FUNCTION public.update_favorites_counters() SET search_path TO public, pg_temp;

ALTER FUNCTION public.trigger_update_save_counters() SECURITY DEFINER;
ALTER FUNCTION public.trigger_update_save_counters() SET search_path TO public, pg_temp;

-- Opcional pero recomendado: permitir invocar el recálculo desde función Edge (programación diaria)
ALTER FUNCTION public.recalculate_favorites_counters() SECURITY DEFINER;
ALTER FUNCTION public.recalculate_favorites_counters() SET search_path TO public, pg_temp;

-- 2) Asegurar (idempotente) que los triggers existen sobre user_saved_restaurants
DO $$
BEGIN
  -- Trigger que mantiene restaurants.favorites_count (+ week/month en eventos de alta/reactivación)
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_restaurant_favorites_counter'
  ) THEN
    CREATE TRIGGER update_restaurant_favorites_counter
      AFTER INSERT OR UPDATE ON public.user_saved_restaurants
      FOR EACH ROW
      EXECUTE FUNCTION public.update_favorites_counters();
  END IF;

  -- Trigger adicional de contadores agregados (popularity_counters y ajustes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_save_counters_restaurants'
  ) THEN
    CREATE TRIGGER update_save_counters_restaurants
      AFTER INSERT OR UPDATE ON public.user_saved_restaurants
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_update_save_counters();
  END IF;
END
$$;
