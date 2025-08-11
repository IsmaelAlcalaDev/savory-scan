
-- 1) Tablas de favoritos
-- Nota: no referenciamos auth.users con FK (recomendación Supabase). Usamos RLS con auth.uid().

create table if not exists public.user_saved_restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  restaurant_id integer not null,
  is_active boolean not null default true,
  saved_from text,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, restaurant_id)
);

create table if not exists public.user_saved_dishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  dish_id integer not null,
  is_active boolean not null default true,
  saved_from text,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dish_id)
);

create table if not exists public.user_saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  event_id integer not null,
  is_active boolean not null default true,
  saved_from text,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- 2) RLS
alter table public.user_saved_restaurants enable row level security;
alter table public.user_saved_dishes enable row level security;
alter table public.user_saved_events enable row level security;

-- Políticas: cada usuario gestiona sus propios favoritos
do $$
begin
  -- Restaurants
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_saved_restaurants' and policyname='Users manage own restaurant favorites') then
    create policy "Users manage own restaurant favorites"
      on public.user_saved_restaurants
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  -- Dishes
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_saved_dishes' and policyname='Users manage own dish favorites') then
    create policy "Users manage own dish favorites"
      on public.user_saved_dishes
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  -- Events
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_saved_events' and policyname='Users manage own event favorites') then
    create policy "Users manage own event favorites"
      on public.user_saved_events
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- 3) Asegurar columnas de contador
alter table if exists public.restaurants
  add column if not exists favorites_count integer not null default 0;

-- dishes y events ya tienen favorites_count según el esquema

-- 4) Triggers para mantener contadores (restaurants, dishes, events)

-- Función genérica para updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Restaurants favorites_count
create or replace function public.tg_favcount_user_saved_restaurants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
$$;

drop trigger if exists trg_usr_fav_rest_set_updated_at on public.user_saved_restaurants;
create trigger trg_usr_fav_rest_set_updated_at
before update on public.user_saved_restaurants
for each row execute function public.set_updated_at();

drop trigger if exists trg_usr_fav_rest_count_ins on public.user_saved_restaurants;
create trigger trg_usr_fav_rest_count_ins
after insert on public.user_saved_restaurants
for each row execute function public.tg_favcount_user_saved_restaurants();

drop trigger if exists trg_usr_fav_rest_count_upd on public.user_saved_restaurants;
create trigger trg_usr_fav_rest_count_upd
after update on public.user_saved_restaurants
for each row execute function public.tg_favcount_user_saved_restaurants();

drop trigger if exists trg_usr_fav_rest_count_del on public.user_saved_restaurants;
create trigger trg_usr_fav_rest_count_del
after delete on public.user_saved_restaurants
for each row execute function public.tg_favcount_user_saved_restaurants();

-- Dishes favorites_count
create or replace function public.tg_favcount_user_saved_dishes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_active then
      update public.dishes
        set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
      where id = new.dish_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if coalesce(old.is_active,false) <> coalesce(new.is_active,false) then
      if new.is_active then
        update public.dishes
          set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
        where id = new.dish_id;
      else
        update public.dishes
          set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
        where id = new.dish_id;
      end if;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.is_active then
      update public.dishes
        set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
      where id = old.dish_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_usr_fav_dish_set_updated_at on public.user_saved_dishes;
create trigger trg_usr_fav_dish_set_updated_at
before update on public.user_saved_dishes
for each row execute function public.set_updated_at();

drop trigger if exists trg_usr_fav_dish_count_ins on public.user_saved_dishes;
create trigger trg_usr_fav_dish_count_ins
after insert on public.user_saved_dishes
for each row execute function public.tg_favcount_user_saved_dishes();

drop trigger if exists trg_usr_fav_dish_count_upd on public.user_saved_dishes;
create trigger trg_usr_fav_dish_count_upd
after update on public.user_saved_dishes
for each row execute function public.tg_favcount_user_saved_dishes();

drop trigger if exists trg_usr_fav_dish_count_del on public.user_saved_dishes;
create trigger trg_usr_fav_dish_count_del
after delete on public.user_saved_dishes
for each row execute function public.tg_favcount_user_saved_dishes();

-- Events favorites_count
create or replace function public.tg_favcount_user_saved_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.is_active then
      update public.events
        set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
      where id = new.event_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if coalesce(old.is_active,false) <> coalesce(new.is_active,false) then
      if new.is_active then
        update public.events
          set favorites_count = greatest(0, coalesce(favorites_count,0) + 1)
        where id = new.event_id;
      else
        update public.events
          set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
        where id = new.event_id;
      end if;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.is_active then
      update public.events
        set favorites_count = greatest(0, coalesce(favorites_count,0) - 1)
      where id = old.event_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_usr_fav_evt_set_updated_at on public.user_saved_events;
create trigger trg_usr_fav_evt_set_updated_at
before update on public.user_saved_events
for each row execute function public.set_updated_at();

drop trigger if exists trg_usr_fav_evt_count_ins on public.user_saved_events;
create trigger trg_usr_fav_evt_count_ins
after insert on public.user_saved_events
for each row execute function public.tg_favcount_user_saved_events();

drop trigger if exists trg_usr_fav_evt_count_upd on public.user_saved_events;
create trigger trg_usr_fav_evt_count_upd
after update on public.user_saved_events
for each row execute function public.tg_favcount_user_saved_events();

drop trigger if exists trg_usr_fav_evt_count_del on public.user_saved_events;
create trigger trg_usr_fav_evt_count_del
after delete on public.user_saved_events
for each row execute function public.tg_favcount_user_saved_events();

-- 5) RPC para toggle restaurante (usa RLS e idempotencia)

create or replace function public.toggle_restaurant_favorite_v2(
  restaurant_id_param integer,
  saved_from_param text default 'button'
)
returns jsonb
language plpgsql
security invoker
set search_path = public
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

  select * into v_existing
  from public.user_saved_restaurants
  where user_id = v_user_id
    and restaurant_id = restaurant_id_param;

  if not found then
    insert into public.user_saved_restaurants(user_id, restaurant_id, is_active, saved_from)
    values (v_user_id, restaurant_id_param, true, saved_from_param)
    returning is_active into v_is_favorite;

    v_action := 'added';
  else
    v_is_favorite := not coalesce(v_existing.is_active, false);

    update public.user_saved_restaurants
      set is_active = v_is_favorite,
          saved_from = saved_from_param,
          updated_at = now()
    where id = v_existing.id;

    v_action := case when v_is_favorite then 'added' else 'removed' end;
  end if;

  return jsonb_build_object(
    'success', true,
    'is_favorite', v_is_favorite,
    'action', v_action
  );
end;
$$;

revoke all on function public.toggle_restaurant_favorite_v2(integer, text) from public;
grant execute on function public.toggle_restaurant_favorite_v2(integer, text) to authenticated;

-- 6) Realtime
alter table public.user_saved_restaurants replica identity full;
alter table public.user_saved_dishes replica identity full;
alter table public.user_saved_events replica identity full;

-- añadir tablas a la publicación realtime (si no estaban añadidas)
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.user_saved_restaurants';
  exception
    when duplicate_object then null;
  end;

  begin
    execute 'alter publication supabase_realtime add table public.user_saved_dishes';
  exception
    when duplicate_object then null;
  end;

  begin
    execute 'alter publication supabase_realtime add table public.user_saved_events';
  exception
    when duplicate_object then null;
  end;
end $$;
