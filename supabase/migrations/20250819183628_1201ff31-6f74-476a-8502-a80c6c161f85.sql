
-- Índice GIST para geometría (sin condición WHERE para mayor flexibilidad)
CREATE INDEX CONCURRENTLY idx_restaurants_geom_gist 
ON restaurants USING GIST (geom);

-- Índice compuesto para la tabla restaurant_cuisines
CREATE INDEX CONCURRENTLY idx_restaurant_cuisines_composite 
ON restaurant_cuisines(restaurant_id, cuisine_type_id);

-- Índice compuesto para filtros de platos
CREATE INDEX CONCURRENTLY idx_dishes_filters_composite 
ON dishes (restaurant_id, is_active, is_vegetarian, is_vegan, is_gluten_free);
