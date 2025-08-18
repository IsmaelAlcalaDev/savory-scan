
-- 0) Preparación: Realtime más seguro y evitar duplicidades

-- Dedupe por si existieran filas repetidas en user_saved_restaurants
DELETE FROM public.user_saved_restaurants a
USING public.user_saved_restaurants b
WHERE a.user_id = b.user_id
  AND a.restaurant_id = b.restaurant_id
  AND a.ctid > b.ctid;

-- 1) Migrar datos de user_favorites a user_saved_restaurants y eliminar la tabla duplicada

-- Migrar pares que no existan aún
INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, is_active, saved_at, saved_from)
SELECT uf.user_id, uf.restaurant_id, true, COALESCE(uf.created_at, now()), 'migrated_from_user_favorites'
FROM public.user_favorites uf
LEFT JOIN public.user_saved_restaurants usr
  ON usr.user_id = uf.user_id AND usr.restaurant_id = uf.restaurant_id
WHERE usr.user_id IS NULL;

-- Eliminar trigger antiguo que actualizaba contadores desde user_favorites (para evitar dobles incrementos)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname='user_favorites'
      AND t.tgname='update_restaurant_favorites_count_trigger'
  ) THEN
    EXECUTE 'DROP TRIGGER update_restaurant_favorites_count_trigger ON public.user_favorites';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignorar
  NULL;
END$$;

-- Eliminar la tabla duplicada por completo
DROP TABLE IF EXISTS public.user_favorites CASCADE;

-- 2) Asegurar unicidad y realtime en user_saved_restaurants

-- Quitar duplicados de nuevo por seguridad
DELETE FROM public.user_saved_restaurants a
USING public.user_saved_restaurants b
WHERE a.user_id = b.user_id
  AND a.restaurant_id = b.restaurant_id
  AND a.ctid > b.ctid;

-- Índice único (evita que un usuario pueda guardar dos veces el mismo restaurante)
CREATE UNIQUE INDEX IF NOT EXISTS user_saved_restaurants_user_restaurant_uniq
ON public.user_saved_restaurants (user_id, restaurant_id);

-- Replica identity full para payloads completos en realtime
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;

-- Añadir a publicación realtime (si ya está, ignorar error)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.user_saved_restaurants';
  EXCEPTION WHEN duplicate_object THEN
    -- ya estaba en la publicación
    NULL;
  END;
END$$;

-- 3) Asegurar cascadas de borrado y no romper RLS

-- FK a users (tabla pública, no auth) con cascada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='user_saved_restaurants'
      AND constraint_name='fk_usr_user'
  ) THEN
    ALTER TABLE public.user_saved_restaurants
    ADD CONSTRAINT fk_usr_user
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END$$;

-- FK a restaurants con cascada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='user_saved_restaurants'
      AND constraint_name='fk_usr_rest'
  ) THEN
    ALTER TABLE public.user_saved_restaurants
    ADD CONSTRAINT fk_usr_rest
    FOREIGN KEY (restaurant_id) REFERENCES public.restaurants(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 4) Triggers de counters/popularidad: actualizar para manejar reactivaciones

-- Reemplazar función que actualiza contadores de popularidad (popularity_counters)
CREATE OR REPLACE FUNCTION public.trigger_update_save_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'user_saved_restaurants' THEN
    -- INSERT en activo => +1 a todos los contadores
    IF TG_OP = 'INSERT' AND COALESCE(NEW.is_active, false) = true THEN
      UPDATE public.popularity_counters
      SET saves_count = COALESCE(saves_count,0) + 1,
          saves_count_week = COALESCE(saves_count_week,0) + 1,
          saves_count_month = COALESCE(saves_count_month,0) + 1,
          last_updated = CURRENT_TIMESTAMP
      WHERE entity_type='restaurant' AND entity_id=NEW.restaurant_id;

    ELSIF TG_OP = 'UPDATE' THEN
      -- Reactivación: false -> true
      IF COALESCE(OLD.is_active,false) = false AND COALESCE(NEW.is_active,false) = true THEN
        UPDATE public.popularity_counters
        SET saves_count = COALESCE(saves_count,0) + 1,
            -- Semanal/Mensual según ventana del NEW.saved_at
            saves_count_week = COALESCE(saves_count_week,0) + CASE WHEN NEW.saved_at > (now() - interval '7 days') THEN 1 ELSE 0 END,
            saves_count_month = COALESCE(saves_count_month,0) + CASE WHEN NEW.saved_at > (now() - interval '30 days') THEN 1 ELSE 0 END,
            last_updated = CURRENT_TIMESTAMP
        WHERE entity_type='restaurant' AND entity_id=NEW.restaurant_id;

      -- Desactivación: true -> false
      ELSIF COALESCE(OLD.is_active,false) = true AND COALESCE(NEW.is_active,false) = false THEN
        UPDATE public.popularity_counters
        SET saves_count = GREATEST(COALESCE(saves_count,0) - 1, 0),
            last_updated = CURRENT_TIMESTAMP
        WHERE entity_type='restaurant' AND entity_id=NEW.restaurant_id;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Confirmar triggers activos: 
--  - update_favorites_counters() sobre restaurantes (ya existe)
--  - trigger_update_save_counters() sobre popularity_counters (ya existe)
-- No creamos triggers nuevos aquí porque ya tienes:
--   trg_user_saved_restaurants_fav_counters (UPDATE/INSERT -> update_favorites_counters)
--   update_save_counters_restaurants (UPDATE/INSERT -> trigger_update_save_counters)

-- 5) Nuevo RPC con analytics + antifraude que devuelve JSON
-- Mantengo el RPC antiguo para compatibilidad. Creamos v2.

CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite_v2(
  restaurant_id_param integer,
  saved_from_param text DEFAULT 'toggle'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_current boolean;
  v_action text;
  v_is_favorite boolean;
  v_now timestamptz := now();
  v_count_actions int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT is_active
  INTO v_current
  FROM public.user_saved_restaurants
  WHERE user_id = v_user_id AND restaurant_id = restaurant_id_param;

  IF v_current IS NULL THEN
    INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, is_active, saved_at, saved_from)
    VALUES (v_user_id, restaurant_id_param, true, v_now, saved_from_param);
    v_action := 'add';
    v_is_favorite := true;

  ELSIF v_current = true THEN
    UPDATE public.user_saved_restaurants
    SET is_active = false, unsaved_at = v_now
    WHERE user_id = v_user_id AND restaurant_id = restaurant_id_param;
    v_action := 'remove';
    v_is_favorite := false;

  ELSE
    UPDATE public.user_saved_restaurants
    SET is_active = true, saved_at = v_now, unsaved_at = NULL, saved_from = saved_from_param
    WHERE user_id = v_user_id AND restaurant_id = restaurant_id_param;
    v_action := 'reactivate';
    v_is_favorite := true;
  END IF;

  -- Analytics
  INSERT INTO public.analytics_events (user_id, event_type, entity_type, entity_id, properties)
  VALUES (
    v_user_id,
    CASE 
      WHEN v_action='add' THEN 'restaurant_saved'
      WHEN v_action='remove' THEN 'restaurant_unsaved'
      ELSE 'restaurant_resaved'
    END,
    'restaurant',
    restaurant_id_param,
    jsonb_build_object('source', saved_from_param, 'action', v_action)
  );

  -- Antifraude: acciones totales de fav en la última hora
  SELECT COUNT(*)
  INTO v_count_actions
  FROM public.analytics_events
  WHERE user_id = v_user_id
    AND created_at > now() - interval '1 hour'
    AND event_type IN ('restaurant_saved','restaurant_unsaved','restaurant_resaved');

  IF v_count_actions > 20 THEN
    INSERT INTO public.suspicious_patterns (
      id, pattern_type, target_type, target_id, pattern_data, confidence_score, first_detected, last_seen, occurrences, status
    )
    VALUES (
      extensions.uuid_generate_v4(),
      'rapid_actions',
      'user',
      v_user_id::text,
      jsonb_build_object('actions_last_hour', v_count_actions, 'time_window_hours', 1),
      0.8, v_now, v_now, 1, 'open'
    )
    ON CONFLICT (pattern_type, target_id) DO UPDATE
      SET last_seen = EXCLUDED.last_seen,
          occurrences = public.suspicious_patterns.occurrences + 1,
          pattern_data = EXCLUDED.pattern_data;

    -- Generar alerta si hay regla activa
    IF EXISTS (SELECT 1 FROM public.fraud_detection_rules WHERE is_active = true AND rule_type = 'rapid_actions') THEN
      INSERT INTO public.fraud_alerts (entity_type, entity_id, severity_level, rule_id, alert_data, created_at, status)
      SELECT 
        'user', v_user_id::text, f.severity_level, f.id,
        jsonb_build_object('actions_last_hour', v_count_actions, 'rule', 'rapid_actions'),
        v_now, 'pending'
      FROM public.fraud_detection_rules f
      WHERE f.is_active = true AND f.rule_type = 'rapid_actions'
      LIMIT 1;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'is_favorite', v_is_favorite, 'action', v_action);
END;
$function$;

-- 6) Jobs de mantenimiento: reset semanal y mensual

-- Extensión de cron (en Supabase suele ir al schema extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Funciones de reseteo
CREATE OR REPLACE FUNCTION public.reset_weekly_favorites_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.restaurants
    SET favorites_count_week = 0;
  UPDATE public.popularity_counters
    SET saves_count_week = 0
  WHERE entity_type='restaurant';
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_monthly_favorites_counters()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.restaurants
    SET favorites_count_month = 0;
  UPDATE public.popularity_counters
    SET saves_count_month = 0
  WHERE entity_type='restaurant';
END;
$$;

-- Programación (rehacer por si existían)
SELECT extensions.cron.unschedule('weekly_favorites_reset')   WHERE EXISTS (SELECT 1);
SELECT extensions.cron.unschedule('monthly_favorites_reset')  WHERE EXISTS (SELECT 1);

SELECT extensions.cron.schedule(
  'weekly_favorites_reset',
  '0 0 * * 1',
  $$SELECT public.reset_weekly_favorites_counters();$$
);

SELECT extensions.cron.schedule(
  'monthly_favorites_reset',
  '0 0 1 * *',
  $$SELECT public.reset_monthly_favorites_counters();$$
);

-- 7) Vistas para dashboard

-- Métricas diarias de favoritos
CREATE OR REPLACE VIEW public.favorites_daily_metrics AS
SELECT
  (date_trunc('day', ae.created_at))::date AS metric_date,
  COUNT(*) FILTER (WHERE ae.event_type IN ('restaurant_saved','restaurant_resaved')) AS total_saved_actions,
  COUNT(DISTINCT ae.user_id) FILTER (WHERE ae.event_type IN ('restaurant_saved','restaurant_resaved')) AS unique_users,
  COUNT(DISTINCT ae.entity_id) FILTER (WHERE ae.event_type IN ('restaurant_saved','restaurant_resaved')) AS unique_restaurants
FROM public.analytics_events ae
WHERE ae.entity_type = 'restaurant'
GROUP BY 1
ORDER BY 1 DESC;

-- Retención (duración media y % que siguen activos)
CREATE OR REPLACE VIEW public.favorites_retention AS
SELECT
  (date_trunc('day', usr.saved_at))::date AS saved_date,
  COUNT(*) AS total_saved,
  COUNT(*) FILTER (WHERE usr.unsaved_at IS NOT NULL) AS total_unsaved,
  ROUND(100.0 * (COUNT(*) FILTER (WHERE usr.unsaved_at IS NULL)) / GREATEST(COUNT(*),1), 2) AS still_favorited_pct,
  AVG(EXTRACT(EPOCH FROM (COALESCE(usr.unsaved_at, now()) - usr.saved_at)) / 86400.0) AS avg_days_favorited
FROM public.user_saved_restaurants usr
WHERE usr.saved_at IS NOT NULL
GROUP BY 1
ORDER BY 1 DESC;

-- Actividad sospechosa (última hora)
CREATE OR REPLACE VIEW public.suspicious_activity AS
SELECT
  ae.user_id,
  COUNT(*) FILTER (WHERE ae.created_at > now() - interval '1 hour' AND ae.event_type IN ('restaurant_saved','restaurant_unsaved','restaurant_resaved')) AS actions_last_hour
FROM public.analytics_events ae
WHERE ae.user_id IS NOT NULL
GROUP BY ae.user_id
HAVING COUNT(*) FILTER (WHERE ae.created_at > now() - interval '1 hour' AND ae.event_type IN ('restaurant_saved','restaurant_unsaved','restaurant_resaved')) > 10;

-- Restaurantes trending (última semana)
CREATE OR REPLACE VIEW public.restaurants_trending_week AS
SELECT
  ae.entity_id AS restaurant_id,
  COUNT(*) FILTER (WHERE ae.event_type IN ('restaurant_saved','restaurant_resaved')) AS saves_last_week
FROM public.analytics_events ae
WHERE ae.entity_type='restaurant' AND ae.created_at > now() - interval '7 days'
GROUP BY ae.entity_id
ORDER BY saves_last_week DESC;

-- 8) Recalcular contadores para dejar todo consistente
SELECT public.recalculate_favorites_counters();
