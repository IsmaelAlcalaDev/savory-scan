
-- Eliminar las funciones relacionadas con categorías de dieta
DROP FUNCTION IF EXISTS get_restaurants_by_diet_categories(text[], numeric, numeric, integer);
DROP FUNCTION IF EXISTS get_diet_category_counts(integer, numeric, numeric, integer);

-- Eliminar la tabla de estadísticas de dieta de restaurantes si existe
DROP TABLE IF EXISTS restaurant_diet_stats;

-- Eliminar cualquier vista materializada relacionada con estadísticas de dieta
DROP MATERIALIZED VIEW IF EXISTS restaurant_diet_stats_mv;
