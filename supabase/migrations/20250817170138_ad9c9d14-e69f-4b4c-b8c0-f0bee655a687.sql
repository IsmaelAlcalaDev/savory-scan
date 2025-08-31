
-- Primero, limpiar los datos actuales de diet_types
DELETE FROM diet_types;

-- Insertar solo las 4 opciones básicas simplificadas
INSERT INTO diet_types (name, slug, icon, category, min_percentage, max_percentage) VALUES
('Sin Gluten', 'sin-gluten', '🌾', 'gluten_free', 20, 100),
('Saludable', 'saludable', '🥗', 'healthy', 20, 100),
('Vegano', 'vegano', '🌱', 'vegan', 20, 100),
('Vegetariano', 'vegetariano', '🥬', 'vegetarian', 20, 100);

-- Crear una vista materializada optimizada para cálculos de dieta de restaurantes
CREATE MATERIALIZED VIEW restaurant_diet_stats AS
WITH restaurant_dish_counts AS (
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    COUNT(d.id) as total_dishes,
    COUNT(CASE WHEN d.is_gluten_free = true THEN 1 END) as gluten_free_dishes,
    COUNT(CASE WHEN d.is_healthy = true THEN 1 END) as healthy_dishes,
    COUNT(CASE WHEN d.is_vegan = true THEN 1 END) as vegan_dishes,
    COUNT(CASE WHEN d.is_vegetarian = true THEN 1 END) as vegetarian_dishes
  FROM restaurants r
  LEFT JOIN dishes d ON r.id = d.restaurant_id 
    AND d.is_active = true 
    AND d.deleted_at IS NULL
  WHERE r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
  GROUP BY r.id, r.name
)
SELECT 
  restaurant_id,
  restaurant_name,
  total_dishes,
  -- Calcular porcentajes y determinar si cumple el 20% mínimo
  CASE 
    WHEN total_dishes > 0 THEN ROUND((gluten_free_dishes::numeric / total_dishes::numeric) * 100, 0)
    ELSE 0 
  END as gluten_free_percentage,
  CASE 
    WHEN total_dishes > 0 THEN ROUND((healthy_dishes::numeric / total_dishes::numeric) * 100, 0)
    ELSE 0 
  END as healthy_percentage,
  CASE 
    WHEN total_dishes > 0 THEN ROUND((vegan_dishes::numeric / total_dishes::numeric) * 100, 0)
    ELSE 0 
  END as vegan_percentage,
  CASE 
    WHEN total_dishes > 0 THEN ROUND((vegetarian_dishes::numeric / total_dishes::numeric) * 100, 0)
    ELSE 0 
  END as vegetarian_percentage,
  -- Flags booleanos para filtrado rápido (>= 20%)
  CASE 
    WHEN total_dishes > 0 AND (gluten_free_dishes::numeric / total_dishes::numeric) >= 0.20 THEN true
    ELSE false 
  END as has_gluten_free_options,
  CASE 
    WHEN total_dishes > 0 AND (healthy_dishes::numeric / total_dishes::numeric) >= 0.20 THEN true
    ELSE false 
  END as has_healthy_options,
  CASE 
    WHEN total_dishes > 0 AND (vegan_dishes::numeric / total_dishes::numeric) >= 0.20 THEN true
    ELSE false 
  END as has_vegan_options,
  CASE 
    WHEN total_dishes > 0 AND (vegetarian_dishes::numeric / total_dishes::numeric) >= 0.20 THEN true
    ELSE false 
  END as has_vegetarian_options
FROM restaurant_dish_counts;

-- Crear índices para performance
CREATE INDEX idx_restaurant_diet_stats_restaurant_id ON restaurant_diet_stats(restaurant_id);
CREATE INDEX idx_restaurant_diet_stats_gluten_free ON restaurant_diet_stats(has_gluten_free_options) WHERE has_gluten_free_options = true;
CREATE INDEX idx_restaurant_diet_stats_healthy ON restaurant_diet_stats(has_healthy_options) WHERE has_healthy_options = true;
CREATE INDEX idx_restaurant_diet_stats_vegan ON restaurant_diet_stats(has_vegan_options) WHERE has_vegan_options = true;
CREATE INDEX idx_restaurant_diet_stats_vegetarian ON restaurant_diet_stats(has_vegetarian_options) WHERE has_vegetarian_options = true;

-- Función para refrescar la vista materializada (se puede llamar con pg_cron o manualmente)
CREATE OR REPLACE FUNCTION refresh_restaurant_diet_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW restaurant_diet_stats;
END;
$$;
