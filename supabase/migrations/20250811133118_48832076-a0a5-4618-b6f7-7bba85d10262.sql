
-- Corregir la función toggle_restaurant_favorite_v2 para eliminar referencias a updated_at
CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite_v2(restaurant_id_param integer, saved_from_param text DEFAULT 'button'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_existing record;
  v_is_favorite boolean;
  v_action text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select user_id, restaurant_id, is_active, saved_at
  into v_existing
  from public.user_saved_restaurants
  where user_id = v_user_id
    and restaurant_id = restaurant_id_param
  limit 1;

  if not found then
    -- primera vez: insertar y activar
    insert into public.user_saved_restaurants(
      user_id, restaurant_id, is_active, saved_from, saved_at
    )
    values (
      v_user_id, restaurant_id_param, true, saved_from_param, now()
    );
    v_is_favorite := true;
    v_action := 'added';
  else
    -- alternar
    v_is_favorite := not coalesce(v_existing.is_active, false);

    if v_is_favorite then
      update public.user_saved_restaurants
      set is_active = true,
          saved_from = saved_from_param,
          saved_at = now(),
          unsaved_at = null
      where user_id = v_user_id
        and restaurant_id = restaurant_id_param;

      v_action := 'added';
    else
      update public.user_saved_restaurants
      set is_active = false,
          saved_from = saved_from_param,
          unsaved_at = now()
      where user_id = v_user_id
        and restaurant_id = restaurant_id_param;

      v_action := 'removed';
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'is_favorite', v_is_favorite,
    'action', v_action
  );
end;
$function$
