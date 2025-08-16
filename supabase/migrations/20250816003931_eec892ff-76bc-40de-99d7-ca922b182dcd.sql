
-- Eliminar las tablas de filtros innecesarios
-- Estas tablas se reemplazan por lógica más simple y eficiente

-- Eliminar tabla distance_ranges (redundante con ordenamiento por distancia)
DROP TABLE IF EXISTS distance_ranges CASCADE;

-- Eliminar tabla time_ranges (reemplazado por filtro "Abierto ahora" funcional)
DROP TABLE IF EXISTS time_ranges CASCADE;

-- Verificar que la tabla restaurant_schedules existe y tiene la estructura correcta
-- Esta tabla SÍ la mantenemos porque es esencial para el filtro "Abierto ahora"
-- Si no existe, la creamos
CREATE TABLE IF NOT EXISTS restaurant_schedules (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 1=Lunes, etc.
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL, 
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, day_of_week)
);

-- Crear índice para optimizar consultas de "Abierto ahora"
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_open_now 
ON restaurant_schedules(restaurant_id, day_of_week, is_closed, opening_time, closing_time);

-- Habilitar RLS para restaurant_schedules
ALTER TABLE restaurant_schedules ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de horarios
CREATE POLICY IF NOT EXISTS "Allow public read access to restaurant schedules" 
ON restaurant_schedules FOR SELECT 
USING (true);
