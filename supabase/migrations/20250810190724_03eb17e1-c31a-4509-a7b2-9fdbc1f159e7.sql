
-- 1) Asegurar Realtime con payloads completos
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;
ALTER TABLE public.user_saved_dishes REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_saved_restaurants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_saved_restaurants;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_saved_dishes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_saved_dishes;
  END IF;
END $$;

-- 2) Endurecer toggle_restaurant_favorite con SECURITY DEFINER y validación
CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite(user_id_param uuid, restaurant_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT is_active INTO is_currently_saved
  FROM public.user_saved_restaurants
  WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;

  IF is_currently_saved IS NULL THEN
    INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, saved_from, is_active, saved_at)
    VALUES (user_id_param, restaurant_id_param, 'toggle', true, CURRENT_TIMESTAMP);
    RETURN true;
  ELSIF is_currently_saved = false THEN
    UPDATE public.user_saved_restaurants
    SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN true;
  ELSE
    UPDATE public.user_saved_restaurants
    SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- 3) Endurecer toggle_dish_favorite con SECURITY DEFINER, fallback y validación
CREATE OR REPLACE FUNCTION public.toggle_dish_favorite(user_id_param uuid, dish_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
  restaurant_id_val INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Intento principal: desde tabla dishes
  SELECT restaurant_id INTO restaurant_id_val
  FROM public.dishes
  WHERE id = dish_id_param;

  -- Fallback: desde vista dishes_full
  IF restaurant_id_val IS NULL THEN
    SELECT restaurant_id INTO restaurant_id_val
    FROM public.dishes_full
    WHERE id = dish_id_param;
  END IF;

  IF restaurant_id_val IS NULL THEN
    RAISE EXCEPTION 'Dish % not found or missing restaurant_id', dish_id_param;
  END IF;

  SELECT is_active INTO is_currently_saved
  FROM public.user_saved_dishes
  WHERE user_id = user_id_param AND dish_id = dish_id_param;

  IF is_currently_saved IS NULL THEN
    INSERT INTO public.user_saved_dishes (user_id, dish_id, restaurant_id, saved_from, is_active, saved_at)
    VALUES (user_id_param, dish_id_param, restaurant_id_val, 'toggle', true, CURRENT_TIMESTAMP);
    RETURN true;
  ELSIF is_currently_saved = false THEN
    UPDATE public.user_saved_dishes
    SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
    WHERE user_id = user_id_param AND dish_id = dish_id_param;
    RETURN true;
  ELSE
    UPDATE public.user_saved_dishes
    SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param AND dish_id = dish_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- 4) Triggers de contadores para restaurantes (usa función ya existente)
DROP TRIGGER IF EXISTS trg_update_restaurant_fav_counters_ins ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_update_restaurant_fav_counters_upd ON public.user_saved_restaurants;

CREATE TRIGGER trg_update_restaurant_fav_counters_ins
AFTER INSERT ON public.user_saved_restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_favorites_counters();

CREATE TRIGGER trg_update_restaurant_fav_counters_upd
AFTER UPDATE ON public.user_saved_restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_favorites_counters();

-- 5) Función y triggers de contadores para platos
CREATE OR REPLACE FUNCTION public.update_dish_favorites_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_active = true THEN
      UPDATE public.dishes
      SET favorites_count = COALESCE(favorites_count, 0) + 1
      WHERE id = NEW.dish_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE public.dishes
      SET favorites_count = COALESCE(favorites_count, 0) + 1
      WHERE id = NEW.dish_id;
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE public.dishes
      SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
      WHERE id = NEW.dish_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_active = true THEN
      UPDATE public.dishes
      SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
      WHERE id = OLD.dish_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_update_dish_fav_counters_ins ON public.user_saved_dishes;
DROP TRIGGER IF EXISTS trg_update_dish_fav_counters_upd ON public.user_saved_dishes;
DROP TRIGGER IF EXISTS trg_update_dish_fav_counters_del ON public.user_saved_dishes;

CREATE TRIGGER trg_update_dish_fav_counters_ins
AFTER INSERT ON public.user_saved_dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_dish_favorites_counters();

CREATE TRIGGER trg_update_dish_fav_counters_upd
AFTER UPDATE ON public.user_saved_dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_dish_favorites_counters();

CREATE TRIGGER trg_update_dish_fav_counters_del
AFTER DELETE ON public.user_saved_dishes
FOR EACH ROW
EXECUTE FUNCTION public.update_dish_favorites_counters();
