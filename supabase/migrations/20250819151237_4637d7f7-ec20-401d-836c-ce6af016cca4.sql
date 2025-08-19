
-- Crear tabla de horarios de restaurante mejorada (si no existe) o actualizarla
CREATE TABLE IF NOT EXISTS public.restaurant_schedules (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Domingo, 6 = Sábado
    is_closed BOOLEAN DEFAULT false,
    -- Primer turno (mañana/mediodía)
    first_opening_time TIME,
    first_closing_time TIME,
    -- Segundo turno (tarde/noche) - para turno partido
    second_opening_time TIME,
    second_closing_time TIME,
    -- Metadata
    notes TEXT, -- Notas especiales para ese día
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id, day_of_week)
);

-- Habilitar RLS
ALTER TABLE public.restaurant_schedules ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Allow public read access to restaurant schedules" 
ON public.restaurant_schedules 
FOR SELECT 
USING (is_active = true);

-- Migrar datos existentes si hay alguna estructura anterior
-- Insertar horarios de ejemplo para restaurantes existentes
INSERT INTO restaurant_schedules (restaurant_id, day_of_week, is_closed, first_opening_time, first_closing_time, second_opening_time, second_closing_time, notes)
VALUES 
-- Restaurante 1 - Horario normal sin turno partido
(1, 0, true, NULL, NULL, NULL, NULL, 'Cerrado los domingos'),
(1, 1, false, '08:00', '16:00', '19:00', '23:00', 'Turno partido'),
(1, 2, false, '08:00', '16:00', '19:00', '23:00', 'Turno partido'),
(1, 3, false, '08:00', '16:00', '19:00', '23:00', 'Turno partido'),
(1, 4, false, '08:00', '16:00', '19:00', '23:00', 'Turno partido'),
(1, 5, false, '08:00', '16:00', '19:00', '00:00', 'Viernes hasta medianoche'),
(1, 6, false, '10:00', NULL, '19:00', '01:00', 'Sábado horario especial'),

-- Restaurante 2 - Sin turno partido
(2, 0, false, '12:00', '23:00', NULL, NULL, 'Domingo abierto'),
(2, 1, false, '11:00', '23:00', NULL, NULL, 'Horario continuo'),
(2, 2, false, '11:00', '23:00', NULL, NULL, 'Horario continuo'),
(2, 3, false, '11:00', '23:00', NULL, NULL, 'Horario continuo'),
(2, 4, false, '11:00', '23:00', NULL, NULL, 'Horario continuo'),
(2, 5, false, '11:00', '01:00', NULL, NULL, 'Viernes hasta tarde'),
(2, 6, false, '11:00', '01:00', NULL, NULL, 'Sábado hasta tarde'),

-- Restaurante 3 - Mixto
(3, 0, true, NULL, NULL, NULL, NULL, 'Cerrado'),
(3, 1, false, '07:00', '15:00', NULL, NULL, 'Solo mañanas'),
(3, 2, false, '07:00', '15:00', '18:00', '22:00', 'Turno partido'),
(3, 3, false, '07:00', '15:00', '18:00', '22:00', 'Turno partido'),
(3, 4, false, '07:00', '15:00', '18:00', '22:00', 'Turno partido'),
(3, 5, false, '07:00', '22:00', NULL, NULL, 'Viernes continuo'),
(3, 6, false, '09:00', '23:00', NULL, NULL, 'Sábado continuo')
ON CONFLICT (restaurant_id, day_of_week) DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_restaurant_id ON restaurant_schedules(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_day_of_week ON restaurant_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_active ON restaurant_schedules(is_active) WHERE is_active = true;

-- Función para verificar si un restaurante está abierto en un momento específico
CREATE OR REPLACE FUNCTION is_restaurant_open_now(
    p_restaurant_id INTEGER,
    p_check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS BOOLEAN AS $$
DECLARE
    current_day INTEGER;
    current_time TIME;
    schedule_row restaurant_schedules%ROWTYPE;
BEGIN
    -- Obtener día de la semana y hora actual
    current_day := EXTRACT(DOW FROM p_check_time);
    current_time := p_check_time::TIME;
    
    -- Buscar horario para ese día
    SELECT * INTO schedule_row 
    FROM restaurant_schedules 
    WHERE restaurant_id = p_restaurant_id 
    AND day_of_week = current_day 
    AND is_active = true;
    
    -- Si no hay horario o está cerrado
    IF NOT FOUND OR schedule_row.is_closed THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar primer turno
    IF schedule_row.first_opening_time IS NOT NULL AND schedule_row.first_closing_time IS NOT NULL THEN
        IF current_time >= schedule_row.first_opening_time AND current_time <= schedule_row.first_closing_time THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Verificar segundo turno (si existe)
    IF schedule_row.second_opening_time IS NOT NULL AND schedule_row.second_closing_time IS NOT NULL THEN
        -- Manejar caso de cierre después de medianoche
        IF schedule_row.second_closing_time < schedule_row.second_opening_time THEN
            -- El cierre es al día siguiente (después de medianoche)
            IF current_time >= schedule_row.second_opening_time OR current_time <= schedule_row.second_closing_time THEN
                RETURN TRUE;
            END IF;
        ELSE
            -- Horario normal del mismo día
            IF current_time >= schedule_row.second_opening_time AND current_time <= schedule_row.second_closing_time THEN
                RETURN TRUE;
            END IF;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Crear vista para obtener información completa de horarios
CREATE OR REPLACE VIEW restaurant_schedules_view AS
SELECT 
    rs.*,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    CASE rs.day_of_week
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
    END as day_name,
    -- Verificar si tiene turno partido
    CASE 
        WHEN rs.second_opening_time IS NOT NULL AND rs.second_closing_time IS NOT NULL 
        THEN TRUE 
        ELSE FALSE 
    END as has_split_schedule,
    -- Formatear horarios legibles
    CASE 
        WHEN rs.is_closed THEN 'Cerrado'
        WHEN rs.second_opening_time IS NOT NULL THEN 
            CONCAT(
                rs.first_opening_time::TEXT, ' - ', rs.first_closing_time::TEXT,
                ' y ',
                rs.second_opening_time::TEXT, ' - ', rs.second_closing_time::TEXT
            )
        ELSE 
            CONCAT(rs.first_opening_time::TEXT, ' - ', rs.first_closing_time::TEXT)
    END as formatted_schedule
FROM restaurant_schedules rs
JOIN restaurants r ON rs.restaurant_id = r.id
WHERE rs.is_active = true;
