
-- Buscar y corregir cualquier función que use usr.id incorrectamente
-- Primero, vamos a recrear la función get_user_favorites que podría estar causando el problema

CREATE OR REPLACE FUNCTION public.get_user_favorites(user_id_param uuid, limit_count integer DEFAULT 20)
 RETURNS TABLE(type character varying, id integer, name character varying, restaurant_name character varying, saved_at timestamp with time zone, image_url character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    -- Restaurantes favoritos
    SELECT 
        'restaurant'::VARCHAR as type,
        r.id,
        r.name,
        r.name as restaurant_name,
        usr.saved_at,
        r.logo_url as image_url
    FROM user_saved_restaurants usr
    JOIN restaurants r ON usr.restaurant_id = r.id
    WHERE usr.user_id = user_id_param AND usr.is_active = true
    
    UNION ALL
    
    -- Platos favoritos
    SELECT 
        'dish'::VARCHAR as type,
        d.id,
        d.name,
        r.name as restaurant_name,
        usd.saved_at,
        d.image_url
    FROM user_saved_dishes usd
    JOIN dishes d ON usd.dish_id = d.id
    JOIN restaurants r ON d.restaurant_id = r.id
    WHERE usd.user_id = user_id_param AND usd.is_active = true
    
    UNION ALL
    
    -- Eventos favoritos
    SELECT 
        'event'::VARCHAR as type,
        e.id,
        e.name,
        r.name as restaurant_name,
        use_table.saved_at,
        e.image_url
    FROM user_saved_events use_table
    JOIN events e ON use_table.event_id = e.id
    JOIN restaurants r ON e.restaurant_id = r.id
    WHERE use_table.user_id = user_id_param AND use_table.is_active = true
    
    ORDER BY saved_at DESC
    LIMIT limit_count;
END;
$function$

-- También vamos a verificar si hay algún trigger o función que esté causando problemas
-- Recrear el trigger de contadores de favoritos para asegurar que esté correcto

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
            FROM public.user_saved_restaurants usr_check
            WHERE usr_check.user_id = NEW.user_id
              AND usr_check.restaurant_id = NEW.restaurant_id
              AND usr_check.id <> NEW.id
              AND usr_check.saved_at > (now() - interval '7 days')
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
            FROM public.user_saved_restaurants usr_check
            WHERE usr_check.user_id = NEW.user_id
              AND usr_check.restaurant_id = NEW.restaurant_id
              AND usr_check.id <> NEW.id
              AND usr_check.saved_at > (now() - interval '30 days')
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
              FROM public.user_saved_restaurants usr_check
              WHERE usr_check.user_id = NEW.user_id
                AND usr_check.restaurant_id = NEW.restaurant_id
                AND usr_check.id <> NEW.id
                AND usr_check.saved_at > (now() - interval '7 days')
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
              FROM public.user_saved_restaurants usr_check
              WHERE usr_check.user_id = NEW.user_id
                AND usr_check.restaurant_id = NEW.restaurant_id
                AND usr_check.id <> NEW.id
                AND usr_check.saved_at > (now() - interval '30 days')
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
$function$
