
-- Revisar y corregir los triggers que pueden estar causando el error "updated_at"
-- Primero, vamos a recrear el trigger para user_saved_restaurants sin referencias a updated_at

CREATE OR REPLACE FUNCTION public.tg_favcount_user_saved_restaurants()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if tg_op = 'INSERT' then
    if new.is_active then
      update public.restaurants
        set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
      where id = new.restaurant_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if coalesce(old.is_active,false) <> coalesce(new.is_active,false) then
      if new.is_active then
        update public.restaurants
          set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
        where id = new.restaurant_id;
      else
        update public.restaurants
          set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
        where id = new.restaurant_id;
      end if;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.is_active then
      update public.restaurants
        set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
      where id = old.restaurant_id;
    end if;
    return old;
  end if;
  return null;
end;
$function$;

-- Verificar que no haya triggers genéricos de updated_at aplicados a user_saved_restaurants
-- Si existe un trigger de updated_at, lo eliminamos para esta tabla específica
DROP TRIGGER IF EXISTS set_updated_at ON public.user_saved_restaurants;
