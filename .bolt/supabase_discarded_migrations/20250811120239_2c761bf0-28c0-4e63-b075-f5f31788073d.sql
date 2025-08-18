
-- 1) Reemplazar función para NO usar usr.id y evitar errores
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
      -- Total activos
      IF COALESCE(NEW.is_active, false) = true THEN
        UPDATE public.restaurants 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.restaurant_id;
      END IF;

      -- Ventanas (semana/mes). En este diseño hay una sola fila por (user_id, restaurant_id),
      -- por lo que podemos sumar directamente si NEW.saved_at está en ventana.
      IF NEW.saved_at IS NOT NULL THEN
        IF NEW.saved_at > (now() - interval '7 days') THEN
          UPDATE public.restaurants 
            SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
          WHERE id = NEW.restaurant_id;
        END IF;

        IF NEW.saved_at > (now() - interval '30 days') THEN
          UPDATE public.restaurants 
            SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
          WHERE id = NEW.restaurant_id;
        END IF;
      END IF;

    -- UPDATE (toggles)
    ELSIF TG_OP = 'UPDATE' THEN
      -- Pase a activo: +1 en total activos
      IF COALESCE(OLD.is_active, false) = false AND COALESCE(NEW.is_active, false) = true THEN
        UPDATE public.restaurants 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.restaurant_id;

        -- Sumar a week/month sólo si antes NO estaba en esa ventana y ahora sí
        IF NEW.saved_at IS NOT NULL THEN
          -- Semana (7 días)
          IF NEW.saved_at > (now() - interval '7 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '7 days')) THEN
            UPDATE public.restaurants 
              SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
            WHERE id = NEW.restaurant_id;
          END IF;

          -- Mes (30 días)
          IF NEW.saved_at > (now() - interval '30 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '30 days')) THEN
            UPDATE public.restaurants 
              SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
            WHERE id = NEW.restaurant_id;
          END IF;
        END IF;

      -- Pase a inactivo: -1 sólo en el total activo
      ELSIF COALESCE(OLD.is_active, false) = true AND COALESCE(NEW.is_active, false) = false THEN
        UPDATE public.restaurants 
          SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = NEW.restaurant_id;
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2) Limpiar triggers duplicados en user_saved_restaurants que llaman a update_favorites_counters()
DROP TRIGGER IF EXISTS trg_update_restaurant_fav_counters_ins ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_update_restaurant_fav_counters_upd ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_user_saved_restaurants_update_fav_counts ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS update_restaurant_favorites_counter ON public.user_saved_restaurants;

-- 3) Crear UN solo trigger claro y consistente para user_saved_restaurants
CREATE TRIGGER trg_user_saved_restaurants_fav_counters
AFTER INSERT OR UPDATE ON public.user_saved_restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_favorites_counters();

-- 4) Eliminar triggers innecesarios que invocan update_favorites_counters desde otras tablas
-- (No realizan ninguna acción útil y sólo añaden sobrecarga/confusión)
DROP TRIGGER IF EXISTS update_dish_favorites_counter ON public.user_saved_dishes;
DROP TRIGGER IF EXISTS update_event_favorites_counter ON public.user_saved_events;

-- Nota: Conservamos el trigger existente que actualiza popularity_counters:
-- update_save_counters_restaurants -> trigger_update_save_counters()
-- No lo tocamos.
