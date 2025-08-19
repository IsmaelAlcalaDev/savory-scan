
-- Paso 1: Mejorar la columna specializes_in_diet para soportar múltiples especializaciones
ALTER TABLE restaurants 
ALTER COLUMN specializes_in_diet TYPE integer[] 
USING CASE 
  WHEN specializes_in_diet IS NULL THEN NULL 
  ELSE ARRAY[specializes_in_diet] 
END;

-- Paso 2: Agregar constraints para validar categorías y rangos de porcentaje
ALTER TABLE diet_types 
ADD CONSTRAINT check_valid_category 
CHECK (category IN ('vegetarian', 'vegan', 'gluten_free', 'healthy'));

ALTER TABLE diet_types 
ADD CONSTRAINT check_valid_percentage_range 
CHECK (min_percentage >= 0 AND max_percentage <= 100 AND min_percentage < max_percentage);

-- Paso 3: Agregar campo de verificación/certificación
ALTER TABLE restaurants 
ADD COLUMN diet_certifications jsonb DEFAULT '[]'::jsonb;

-- Paso 4: Agregar índices para mejor performance en filtros
CREATE INDEX IF NOT EXISTS idx_dishes_diet_flags 
ON dishes (restaurant_id, is_vegetarian, is_vegan, is_gluten_free, is_healthy) 
WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_diet_specialization 
ON restaurants USING GIN (specializes_in_diet) 
WHERE is_active = true AND is_published = true;

-- Paso 5: Agregar campo para cachear porcentajes calculados (opcional para performance)
ALTER TABLE restaurants 
ADD COLUMN diet_percentages jsonb DEFAULT '{}'::jsonb;

-- Comentar campos existentes para documentación
COMMENT ON COLUMN restaurants.specializes_in_diet IS 'Array de IDs de diet_types en los que se especializa el restaurante';
COMMENT ON COLUMN restaurants.diet_certifications IS 'Array de certificaciones oficiales de dieta (ej: certificado vegano, sin gluten, etc.)';
COMMENT ON COLUMN restaurants.diet_percentages IS 'Cache de porcentajes calculados por categoría de dieta para performance';
