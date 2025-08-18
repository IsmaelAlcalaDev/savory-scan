
-- Crear función RPC: toggle_restaurant_favorite_v2
create or replace function public.toggle_restaurant_favorite_v2(
  restaurant_id_param integer,
  saved_from_param text default 'toggle'
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_active boolean;
  v_action text;
  v_delta integer;
  v_actions_last_hour integer;
  v_rule_id integer;
  v_rule_severity integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Estado actual
  select usr.is_active
    into v_is_active
  from public.user_saved_restaurants usr
  where usr.user_id = v_user_id
    and usr.restaurant_id = restaurant_id_param;

  -- Toggle
  if v_is_active is null then
    insert into public.user_saved_restaurants
      (user_id, restaurant_id, saved_from, is_active, saved_at)
    values
      (v_user_id, restaurant_id_param, saved_from_param, true, current_timestamp);
    v_action := 'saved';

  elsif v_is_active = false then
    update public.user_saved_restaurants
      set is_active = true,
          saved_at = current_timestamp,
          unsaved_at = null,
          saved_from = saved_from_param
    where user_id = v_user_id
      and restaurant_id = restaurant_id_param;
    v_action := 'reactivated';

  else
    update public.user_saved_restaurants
      set is_active = false,
          unsaved_at = current_timestamp
    where user_id = v_user_id
      and restaurant_id = restaurant_id_param;
    v_action := 'unsaved';
  end if;

  -- Analytics
  insert into public.analytics_events (event_type, entity_type, entity_id, user_id, properties)
  values (
    case v_action
      when 'saved' then 'restaurant_saved'
      when 'reactivated' then 'restaurant_resaved'
      else 'restaurant_unsaved'
    end,
    'restaurant',
    restaurant_id_param,
    v_user_id,
    jsonb_build_object('source', saved_from_param, 'action', v_action)
  );

  -- Métricas del día (saves_count)
  v_delta := case when v_action in ('saved','reactivated') then 1 else -1 end;

  insert into public.restaurant_metrics (restaurant_id, metric_date, saves_count)
  values (restaurant_id_param, current_date, 0)
  on conflict (restaurant_id, metric_date)
  do update set
    saves_count = greatest(coalesce(public.restaurant_metrics.saves_count, 0) + v_delta, 0),
    updated_at = current_timestamp;

  -- Anti-fraude: acciones rápidas
  select count(*) into v_actions_last_hour
  from public.analytics_events
  where user_id = v_user_id
    and event_type in ('restaurant_saved','restaurant_resaved','restaurant_unsaved')
    and created_at > (now() - interval '1 hour');

  if v_actions_last_hour > 20 then
    -- Registrar patrón sospechoso
    insert into public.suspicious_patterns (pattern_type, target_type, target_id, pattern_data, confidence_score)
    values (
      'rapid_actions', 'user', v_user_id::text,
      jsonb_build_object('actions_last_hour', v_actions_last_hour, 'time_window_hours', 1),
      0.8
    )
    on conflict (pattern_type, target_id) do update set
      occurrences = public.suspicious_patterns.occurrences + 1,
      last_seen = current_timestamp,
      pattern_data = excluded.pattern_data;

    -- Crear alerta si hay regla activa
    select id, severity_level
      into v_rule_id, v_rule_severity
    from public.fraud_detection_rules
    where is_active = true
      and rule_type = 'rapid_actions'
    order by severity_level desc
    limit 1;

    if v_rule_id is not null then
      insert into public.fraud_alerts (
        entity_type, entity_id, rule_id, severity_level, status, alert_data
      ) values (
        'user',
        v_user_id::text,
        v_rule_id,
        v_rule_severity,
        'pending',
        jsonb_build_object(
          'reason','rapid_actions',
          'actions_last_hour', v_actions_last_hour,
          'threshold', 20,
          'restaurant_id', restaurant_id_param
        )
      );
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'is_favorite', (v_action in ('saved','reactivated')),
    'action', v_action
  );
end;
$$;
