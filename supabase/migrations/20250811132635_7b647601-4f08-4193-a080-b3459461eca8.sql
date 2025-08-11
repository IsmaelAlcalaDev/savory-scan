
-- 1) Crear/actualizar la función RPC esperada por el frontend
create or replace function public.toggle_restaurant_favorite_v2(
  restaurant_id_param integer,
  saved_from_param text default 'button'
)
returns jsonb
language plpgsql
security definer
set search_path to public
as $$
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
      user_id, restaurant_id, is_active, saved_from, saved_at, updated_at
    )
    values (
      v_user_id, restaurant_id_param, true, saved_from_param, now(), now()
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
          unsaved_at = null,
          updated_at = now()
      where user_id = v_user_id
        and restaurant_id = restaurant_id_param;

      v_action := 'added';
    else
      update public.user_saved_restaurants
      set is_active = false,
          saved_from = saved_from_param,
          unsaved_at = now(),
          updated_at = now()
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
$$;

-- 2) Trigger único para mantener restaurants.favorites_count sincronizado

-- Función ya existe en tu proyecto (según el inventario), pero por si no, se puede recrear.
-- Si ya existe, esta parte no hará falta; la dejamos solo el trigger.
-- create or replace function public.tg_favcount_user_saved_restaurants()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path to public
-- as $$
-- begin
--   if tg_op = 'INSERT' then
--     if new.is_active then
--       update public.restaurants
--         set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
--       where id = new.restaurant_id;
--     end if;
--     return new;
--   elsif tg_op = 'UPDATE' then
--     if coalesce(old.is_active,false) <> coalesce(new.is_active,false) then
--       if new.is_active then
--         update public.restaurants
--           set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
--         where id = new.restaurant_id;
--       else
--         update public.restaurants
--           set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
--         where id = new.restaurant_id;
--       end if;
--     end if;
--     return new;
--   elsif tg_op = 'DELETE' then
--     if old.is_active then
--       update public.restaurants
--         set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
--       where id = old.restaurant_id;
--     end if;
--     return old;
--   end if;
--   return null;
-- end;
-- $$;

drop trigger if exists tr_favcount_user_saved_restaurants on public.user_saved_restaurants;

create trigger tr_favcount_user_saved_restaurants
after insert or update or delete on public.user_saved_restaurants
for each row execute function public.tg_favcount_user_saved_restaurants();

-- 3) REPLICA IDENTITY para payloads completos en realtime
alter table public.user_saved_restaurants replica identity full;
alter table public.restaurants replica identity full;

-- 4) Asegurar publicación en supabase_realtime (no duplicar si ya están)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname='supabase_realtime' and schemaname='public' and tablename='user_saved_restaurants'
  ) then
    execute 'alter publication supabase_realtime add table public.user_saved_restaurants';
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname='supabase_realtime' and schemaname='public' and tablename='restaurants'
  ) then
    execute 'alter publication supabase_realtime add table public.restaurants';
  end if;
end
$$;
