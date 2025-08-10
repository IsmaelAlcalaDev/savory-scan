
-- Fix: reescribir upsert_user_auth_provider para satisfacer NOT NULL de users.full_name
create or replace function public.upsert_user_auth_provider(
  p_provider auth_provider,
  p_provider_user_id text default null,
  p_provider_email text default null,
  p_provider_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Asegurar fila en users con full_name y avatar_url para no violar NOT NULL
  insert into public.users (id, email, full_name, avatar_url, created_at, updated_at)
  values (
    auth.uid(),
    p_provider_email,
    coalesce(nullif(p_provider_data->>'full_name', ''), p_provider_email),
    nullif(p_provider_data->>'avatar_url', ''),
    current_timestamp,
    current_timestamp
  )
  on conflict (id) do update set
    email      = coalesce(excluded.email, public.users.email),
    full_name  = coalesce(excluded.full_name, public.users.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
    updated_at = current_timestamp;

  -- Upsert del proveedor
  insert into public.user_auth_providers (
    id, user_id, provider, provider_user_id, provider_email, provider_data, created_at
  )
  values (
    extensions.uuid_generate_v4(),
    auth.uid(),
    p_provider,
    p_provider_user_id,
    p_provider_email,
    coalesce(p_provider_data, '{}'::jsonb),
    current_timestamp
  )
  on conflict (user_id, provider)
  do update set
    provider_user_id = excluded.provider_user_id,
    provider_email   = excluded.provider_email,
    provider_data    = excluded.provider_data;

  -- Métricas de login
  update public.users
  set 
    last_login_at = current_timestamp,
    login_count   = coalesce(login_count, 0) + 1,
    updated_at    = current_timestamp
  where id = auth.uid();
end;
$$;
