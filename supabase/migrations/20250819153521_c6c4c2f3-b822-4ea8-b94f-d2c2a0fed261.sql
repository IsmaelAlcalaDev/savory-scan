
-- Crear la función para verificar si un restaurante está abierto ahora
CREATE OR REPLACE FUNCTION is_restaurant_open_now(restaurant_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    current_day smallint;
    current_time time;
    schedule_record RECORD;
BEGIN
    -- Obtener el día actual (0 = Domingo, 1 = Lunes, etc.)
    current_day := EXTRACT(DOW FROM NOW());
    current_time := NOW()::TIME;
    
    -- Buscar el horario del restaurante para el día actual
    SELECT * INTO schedule_record 
    FROM restaurant_schedules 
    WHERE restaurant_id = restaurant_id_param 
      AND day_of_week = current_day 
      AND is_active = true
      AND is_closed = false;
    
    -- Si no hay horario o está cerrado, retornar false
    IF NOT FOUND OR schedule_record.is_closed THEN
        RETURN false;
    END IF;
    
    -- Verificar primer turno
    IF schedule_record.first_opening_time IS NOT NULL 
       AND schedule_record.first_closing_time IS NOT NULL THEN
        
        -- Si el horario no cruza medianoche
        IF schedule_record.first_closing_time > schedule_record.first_opening_time THEN
            IF current_time >= schedule_record.first_opening_time 
               AND current_time <= schedule_record.first_closing_time THEN
                RETURN true;
            END IF;
        -- Si el horario cruza medianoche
        ELSE
            IF current_time >= schedule_record.first_opening_time 
               OR current_time <= schedule_record.first_closing_time THEN
                RETURN true;
            END IF;
        END IF;
    END IF;
    
    -- Verificar segundo turno (turno partido)
    IF schedule_record.second_opening_time IS NOT NULL 
       AND schedule_record.second_closing_time IS NOT NULL THEN
        
        -- Si el horario no cruza medianoche
        IF schedule_record.second_closing_time > schedule_record.second_opening_time THEN
            IF current_time >= schedule_record.second_opening_time 
               AND current_time <= schedule_record.second_closing_time THEN
                RETURN true;
            END IF;
        -- Si el horario cruza medianoche
        ELSE
            IF current_time >= schedule_record.second_opening_time 
               OR current_time <= schedule_record.second_closing_time THEN
                RETURN true;
            END IF;
        END IF;
    END IF;
    
    -- Si no cumple ninguna condición, está cerrado
    RETURN false;
END;
$$;

-- Crear índice para optimizar las consultas de horarios
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_active_day 
ON restaurant_schedules(restaurant_id, day_of_week, is_active, is_closed);
