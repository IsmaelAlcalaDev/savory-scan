
-- Fix: toggle_restaurant_favorite_v2 no debe usar "id" en user_saved_restaurants

CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite_v2(
  restaurant_id_param integer,
  saved_from_param text DEFAULT 'button'
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_existing RECORD;
  v_is_favorite boolean;
  v_action text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id, restaurant_id, is_active, saved_at
  INTO v_existing
  FROM public.user_saved_restaurants
  WHERE user_id = v_user_id
    AND restaurant_id = restaurant_id_param
  LIMIT 1;

  IF NOT FOUND THEN
    -- Primera vez: insertar y activar
    INSERT INTO public.user_saved_restaurants(
      user_id, restaurant_id, is_active, saved_from, saved_at, updated_at
    )
    VALUES (
      v_user_id, restaurant_id_param, true, saved_from_param, now(), now()
    );
    v_is_favorite := true;
    v_action := 'added';
  ELSE
    -- Alternar estado
    v_is_favorite := NOT COALESCE(v_existing.is_active, false);

    IF v_is_favorite THEN
      UPDATE public.user_saved_restaurants
      SET is_active = true,
          saved_from = saved_from_param,
          saved_at = now(),
          unsaved_at = NULL,
          updated_at = now()
      WHERE user_id = v_user_id
        AND restaurant_id = restaurant_id_param;

      v_action := 'added';
    ELSE
      UPDATE public.user_saved_restaurants
      SET is_active = false,
          saved_from = saved_from_param,
          unsaved_at = now(),
          updated_at = now()
      WHERE user_id = v_user_id
        AND restaurant_id = restaurant_id_param;

      v_action := 'removed';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_favorite', v_is_favorite,
    'action', v_action
  );
END;
$function$;

-- Asegurar que realtime obtenga old/new completas:
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;
