
-- 1) Trigger: contar week/month como "primer añadido del usuario en la ventana", no por toggles
CREATE OR REPLACE FUNCTION public.update_favorites_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Solo aplicamos lógica para la tabla de restaurantes
  IF TG_TABLE_NAME = 'user_saved_restaurants' THEN
    -- INSERT
    IF TG_OP = 'INSERT' THEN
      -- Estado actual de favoritos (total activos)
      IF NEW.is_active = true THEN
        UPDATE restaurants 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.restaurant_id;
      END IF;

      -- Añadidos únicos por ventana (week / month) - solo si NEW.saved_at cae en ventana
      IF NEW.saved_at IS NOT NULL THEN
        -- Semana (7 días): solo sumar si no existe otro save del mismo usuario en ventana
        IF NEW.saved_at > (now() - interval '7 days') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM public.user_saved_restaurants usr
            WHERE usr.user_id = NEW.user_id
              AND usr.restaurant_id = NEW.restaurant_id
              AND usr.id <> NEW.id
              AND usr.saved_at > (now() - interval '7 days')
          ) THEN
            UPDATE restaurants 
              SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
            WHERE id = NEW.restaurant_id;
          END IF;
        END IF;

        -- Mes (30 días): solo sumar si no existe otro save del mismo usuario en ventana
        IF NEW.saved_at > (now() - interval '30 days') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM public.user_saved_restaurants usr
            WHERE usr.user_id = NEW.user_id
              AND usr.restaurant_id = NEW.restaurant_id
              AND usr.id <> NEW.id
              AND usr.saved_at > (now() - interval '30 days')
          ) THEN
            UPDATE restaurants 
              SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
            WHERE id = NEW.restaurant_id;
          END IF;
        END IF;
      END IF;

    -- UPDATE (toggles)
    ELSIF TG_OP = 'UPDATE' THEN
      -- Paso a activo: +1 en total activos
      IF OLD.is_active = false AND NEW.is_active = true THEN
        UPDATE restaurants 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.restaurant_id;

        -- Solo sumar a week/month si el OLD.saved_at NO estaba dentro de la ventana
        -- (i.e. es la "primera vez" en esta ventana)
        IF NEW.saved_at IS NOT NULL THEN
          -- Semana (7 días)
          IF NEW.saved_at > (now() - interval '7 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '7 days')) THEN
            -- evitar duplicados por registros paralelos
            IF NOT EXISTS (
              SELECT 1
              FROM public.user_saved_restaurants usr
              WHERE usr.user_id = NEW.user_id
                AND usr.restaurant_id = NEW.restaurant_id
                AND usr.id <> NEW.id
                AND usr.saved_at > (now() - interval '7 days')
            ) THEN
              UPDATE restaurants 
                SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
              WHERE id = NEW.restaurant_id;
            END IF;
          END IF;

          -- Mes (30 días)
          IF NEW.saved_at > (now() - interval '30 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '30 days')) THEN
            IF NOT EXISTS (
              SELECT 1
              FROM public.user_saved_restaurants usr
              WHERE usr.user_id = NEW.user_id
                AND usr.restaurant_id = NEW.restaurant_id
                AND usr.id <> NEW.id
                AND usr.saved_at > (now() - interval '30 days')
            ) THEN
              UPDATE restaurants 
                SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
              WHERE id = NEW.restaurant_id;
            END IF;
          END IF;
        END IF;

      -- Paso a inactivo: -1 solo en el total activo; NO tocar week/month
      ELSIF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE restaurants 
          SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = NEW.restaurant_id;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Asegurar trigger en user_saved_restaurants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgrelid = 'public.user_saved_restaurants'::regclass
      AND tgname = 'trg_user_saved_restaurants_update_fav_counts'
  ) THEN
    CREATE TRIGGER trg_user_saved_restaurants_update_fav_counts
    AFTER INSERT OR UPDATE ON public.user_saved_restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_favorites_counters();
  END IF;
END
$$;

-- 2) Recalculo consistente: contar usuarios únicos en ventana (no toggles) y total activo actual
CREATE OR REPLACE FUNCTION public.recalculate_favorites_counters()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Total activos (estado actual)
  UPDATE restaurants r
  SET 
    favorites_count = COALESCE(totals.total_active, 0)
  FROM (
    SELECT restaurant_id, COUNT(*) AS total_active
    FROM public.user_saved_restaurants
    WHERE is_active = true
    GROUP BY restaurant_id
  ) totals
  WHERE r.id = totals.restaurant_id;

  -- Semana (7 días): usuarios únicos que han añadido en la ventana, sin importar si ahora está activo
  UPDATE restaurants r
  SET 
    favorites_count_week = COALESCE(week_totals.user_count, 0)
  FROM (
    SELECT restaurant_id, COUNT(DISTINCT user_id) AS user_count
    FROM public.user_saved_restaurants
    WHERE saved_at > (now() - interval '7 days')
    GROUP BY restaurant_id
  ) week_totals
  WHERE r.id = week_totals.restaurant_id;

  -- Mes (30 días): usuarios únicos que han añadido en la ventana
  UPDATE restaurants r
  SET 
    favorites_count_month = COALESCE(month_totals.user_count, 0)
  FROM (
    SELECT restaurant_id, COUNT(DISTINCT user_id) AS user_count
    FROM public.user_saved_restaurants
    WHERE saved_at > (now() - interval '30 days')
    GROUP BY restaurant_id
  ) month_totals
  WHERE r.id = month_totals.restaurant_id;

  RAISE NOTICE 'Recalculo de favoritos completado (unique users por ventana)';
END;
$function$;

-- 3) Índices para rendimiento de ventanas y joins
CREATE INDEX IF NOT EXISTS idx_usr_restaurant_saved_at
  ON public.user_saved_restaurants (restaurant_id, saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_usr_restaurant_user_saved_at
  ON public.user_saved_restaurants (restaurant_id, user_id, saved_at DESC);

-- 4) (Ya aplicado antes) Realtime robusto: mantener por seguridad
ALTER TABLE public.user_saved_restaurants REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_saved_restaurants'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.user_saved_restaurants';
  END IF;
END
$$;
