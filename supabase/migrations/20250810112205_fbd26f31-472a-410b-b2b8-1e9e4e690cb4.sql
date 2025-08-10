
-- Crear tabla para rangos de precios
CREATE TABLE public.price_ranges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  display_text VARCHAR(100) NOT NULL,
  value VARCHAR(20) NOT NULL UNIQUE,
  min_price NUMERIC,
  max_price NUMERIC,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar rangos de precios por defecto
INSERT INTO public.price_ranges (name, display_text, value, min_price, max_price, display_order) VALUES
('Económico', '€ - Económico (hasta 15€)', 'budget', 0, 15, 1),
('Moderado', '€€ - Moderado (15-25€)', 'moderate', 15, 25, 2),
('Caro', '€€€ - Caro (25-40€)', 'expensive', 25, 40, 3),
('Lujo', '€€€€ - Lujo (más de 40€)', 'luxury', 40, null, 4);

-- Crear tabla para horarios/franjas de tiempo
CREATE TABLE public.time_ranges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  display_text VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar horarios por defecto
INSERT INTO public.time_ranges (name, display_text, start_time, end_time, display_order) VALUES
('Desayuno', 'Desayuno (07:00 - 11:00)', '07:00', '11:00', 1),
('Almuerzo', 'Almuerzo (11:00 - 16:00)', '11:00', '16:00', 2),
('Merienda', 'Merienda (16:00 - 19:00)', '16:00', '19:00', 3),
('Cena', 'Cena (19:00 - 24:00)', '19:00', '23:59', 4),
('Noche', 'Noche (00:00 - 07:00)', '00:00', '07:00', 5);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.price_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_ranges ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir lectura pública
CREATE POLICY "Allow public read access to price_ranges" ON public.price_ranges
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to time_ranges" ON public.time_ranges
  FOR SELECT USING (true);
