
-- Script para crear datos de prueba para los filtros de platos
-- Ejecuta este script en tu base de datos

-- Actualizar algunos restaurantes con ratings altos
UPDATE restaurants 
SET google_rating = 4.8 
WHERE id = 1;

UPDATE restaurants 
SET google_rating = 4.6 
WHERE id = 2;

UPDATE restaurants 
SET google_rating = 3.2 
WHERE id = 3;

-- Actualizar algunos platos con datos de prueba
UPDATE dishes 
SET 
  is_vegetarian = true,
  is_vegan = false,
  is_gluten_free = true,
  is_healthy = true,
  spice_level = 1,
  custom_tags = '["Popular", "Saludable"]'::jsonb,
  base_price = 12.50
WHERE id = 1;

UPDATE dishes 
SET 
  is_vegetarian = false,
  is_vegan = false,
  is_gluten_free = false,
  is_healthy = false,
  spice_level = 3,
  custom_tags = '["Picante", "Tradicional"]'::jsonb,
  base_price = 18.90
WHERE id = 2;

UPDATE dishes 
SET 
  is_vegetarian = true,
  is_vegan = true,
  is_gluten_free = false,
  is_healthy = true,
  spice_level = 0,
  custom_tags = '["Vegano", "Ligero"]'::jsonb,
  base_price = 8.75
WHERE id = 3;

-- Verificar que los datos se insertaron correctamente
SELECT 
  d.id,
  d.name as dish_name,
  d.base_price,
  d.is_vegetarian,
  d.is_vegan,
  d.spice_level,
  r.name as restaurant_name,
  r.google_rating
FROM dishes d
JOIN restaurants r ON d.restaurant_id = r.id
WHERE d.is_active = true AND r.is_active = true
LIMIT 10;
