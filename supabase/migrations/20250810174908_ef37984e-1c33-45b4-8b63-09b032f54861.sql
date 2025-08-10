
-- 1) Reemplazar la función para manejar correctamente week y month en ALTAS, REACTIVACIONES y BAJAS
CREATE OR REPLACE FUNCTION public.update_favorites_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Para restaurantes
    IF TG_TABLE_NAME = 'user_saved_restaurants' THEN
        IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
            UPDATE restaurants 
            SET 
                favorites_count       = favorites_count + 1,
                favorites_count_week  = favorites_count_week  + CASE WHEN NEW.saved_at > CURRENT_DATE - INTERVAL '7 days'  THEN 1 ELSE 0 END,
                favorites_count_month = favorites_count_month + CASE WHEN NEW.saved_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END
            WHERE id = NEW.restaurant_id;

        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
            -- Reactivación
            UPDATE restaurants 
            SET 
                favorites_count       = favorites_count + 1,
                favorites_count_week  = favorites_count_week  + CASE WHEN NEW.saved_at > CURRENT_DATE - INTERVAL '7 days'  THEN 1 ELSE 0 END,
                favorites_count_month = favorites_count_month + CASE WHEN NEW.saved_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END
            WHERE id = NEW.restaurant_id;

        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
            -- Baja: solo restar de week/month si el guardado sigue dentro de la ventana
            UPDATE restaurants 
            SET 
                favorites_count       = GREATEST(favorites_count - 1, 0),
                favorites_count_week  = GREATEST(favorites_count_week  - CASE WHEN OLD.saved_at > CURRENT_DATE - INTERVAL '7 days'  THEN 1 ELSE 0 END, 0),
                favorites_count_month = GREATEST(favorites_count_month - CASE WHEN OLD.saved_at > CURRENT_DATE - INTERVAL '30 days' THEN 1 ELSE 0 END, 0)
            WHERE id = NEW.restaurant_id;
        END IF;
    END IF;

    -- Para platos (mantenemos la lógica existente)
    IF TG_TABLE_NAME = 'user_saved_dishes' THEN
        IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
            UPDATE dishes 
            SET favorites_count = favorites_count + 1,
                favorites_count_week = favorites_count_week + 1
            WHERE id = NEW.dish_id;
        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
            UPDATE dishes 
            SET favorites_count = GREATEST(favorites_count - 1, 0)
            WHERE id = NEW.dish_id;
        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
            UPDATE dishes 
            SET favorites_count = favorites_count + 1,
                favorites_count_week = favorites_count_week + 1
            WHERE id = NEW.dish_id;
        END IF;
    END IF;

    -- Para eventos (mantenemos la lógica existente)
    IF TG_TABLE_NAME = 'user_saved_events' THEN
        IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
            UPDATE events 
            SET favorites_count = favorites_count + 1,
                favorites_count_week = favorites_count_week + 1
            WHERE id = NEW.event_id;
        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = true AND NEW.is_active = false THEN
            UPDATE events 
            SET favorites_count = GREATEST(favorites_count - 1, 0)
            WHERE id = NEW.event_id;
        ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
            UPDATE events 
            SET favorites_count = favorites_count + 1,
                favorites_count_week = favorites_count_week + 1
            WHERE id = NEW.event_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2) Programar un job diario (UTC 03:10) para recalcular week/month y evitar drift
--    (idempotente: crea la extensión y el job solo si no existen)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'recalc-favorites-windows-daily') THEN
    PERFORM cron.schedule(
      'recalc-favorites-windows-daily',
      '10 3 * * *',  -- todos los días a las 03:10 UTC
      $$SELECT public.recalculate_favorites_counters();$$
    );
  END IF;
END
$$;
