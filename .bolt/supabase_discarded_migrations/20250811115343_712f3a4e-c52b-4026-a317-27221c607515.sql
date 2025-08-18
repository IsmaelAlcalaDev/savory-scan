
-- Corregir la función toggle_restaurant_favorite para eliminar referencias incorrectas
CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite(user_id_param uuid, restaurant_id_param integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
BEGIN
  -- Verificar autenticación
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verificar estado actual del favorito
  SELECT is_active INTO is_currently_saved
  FROM public.user_saved_restaurants
  WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;

  -- Lógica de toggle
  IF is_currently_saved IS NULL THEN
    -- Primera vez: crear nuevo registro
    INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, saved_from, is_active, saved_at)
    VALUES (user_id_param, restaurant_id_param, 'toggle', true, CURRENT_TIMESTAMP);
    RETURN true;
  ELSIF is_currently_saved = false THEN
    -- Reactivar favorito
    UPDATE public.user_saved_restaurants
    SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN true;
  ELSE
    -- Desactivar favorito
    UPDATE public.user_saved_restaurants
    SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN false;
  END IF;
END;
$function$
