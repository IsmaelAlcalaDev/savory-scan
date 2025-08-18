
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create materialized view for city-based facets
CREATE MATERIALIZED VIEW public.mv_facets_city AS
SELECT 
    r.city_id,
    c.name as city_name,
    rc.cuisine_type_id,
    ct.name as cuisine_name,
    ct.icon as cuisine_icon,
    r.price_range,
    r.establishment_type_id,
    et.name as establishment_type_name,
    et.icon as establishment_type_icon,
    COUNT(DISTINCT r.id) as restaurant_count,
    -- Diet aggregations (restaurants with ≥20% of dishes in each category)
    COUNT(DISTINCT CASE WHEN rds.vegetarian_pct >= 20 THEN r.id END) as vegetarian_restaurants,
    COUNT(DISTINCT CASE WHEN rds.vegan_pct >= 20 THEN r.id END) as vegan_restaurants,
    COUNT(DISTINCT CASE WHEN rds.glutenfree_pct >= 20 THEN r.id END) as glutenfree_restaurants,
    COUNT(DISTINCT CASE WHEN rds.healthy_pct >= 20 THEN r.id END) as healthy_restaurants,
    -- Average ratings for the segment
    AVG(r.google_rating) as avg_rating,
    -- Last update timestamp
    CURRENT_TIMESTAMP as last_updated
FROM restaurants r
INNER JOIN cities c ON r.city_id = c.id
LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
WHERE r.is_active = true 
    AND r.deleted_at IS NULL
    AND r.is_published = true
GROUP BY 
    r.city_id, c.name, rc.cuisine_type_id, ct.name, ct.icon,
    r.price_range, r.establishment_type_id, et.name, et.icon;

-- Create global facets view (fallback for when location is unknown)
CREATE MATERIALIZED VIEW public.mv_facets_global AS
SELECT 
    rc.cuisine_type_id,
    ct.name as cuisine_name,
    ct.icon as cuisine_icon,
    r.price_range,
    r.establishment_type_id,
    et.name as establishment_type_name,
    et.icon as establishment_type_icon,
    COUNT(DISTINCT r.id) as restaurant_count,
    -- Diet aggregations
    COUNT(DISTINCT CASE WHEN rds.vegetarian_pct >= 20 THEN r.id END) as vegetarian_restaurants,
    COUNT(DISTINCT CASE WHEN rds.vegan_pct >= 20 THEN r.id END) as vegan_restaurants,
    COUNT(DISTINCT CASE WHEN rds.glutenfree_pct >= 20 THEN r.id END) as glutenfree_restaurants,
    COUNT(DISTINCT CASE WHEN rds.healthy_pct >= 20 THEN r.id END) as healthy_restaurants,
    AVG(r.google_rating) as avg_rating,
    CURRENT_TIMESTAMP as last_updated
FROM restaurants r
LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
WHERE r.is_active = true 
    AND r.deleted_at IS NULL
    AND r.is_published = true
GROUP BY 
    rc.cuisine_type_id, ct.name, ct.icon,
    r.price_range, r.establishment_type_id, et.name, et.icon;

-- Create indexes for optimal performance
CREATE INDEX CONCURRENTLY idx_mv_facets_city_main 
ON mv_facets_city (city_id, cuisine_type_id, price_range, establishment_type_id);

CREATE INDEX CONCURRENTLY idx_mv_facets_city_city 
ON mv_facets_city (city_id);

CREATE INDEX CONCURRENTLY idx_mv_facets_city_cuisine 
ON mv_facets_city (cuisine_type_id);

CREATE INDEX CONCURRENTLY idx_mv_facets_city_price 
ON mv_facets_city (price_range);

CREATE INDEX CONCURRENTLY idx_mv_facets_city_establishment 
ON mv_facets_city (establishment_type_id);

CREATE INDEX CONCURRENTLY idx_mv_facets_global_main 
ON mv_facets_global (cuisine_type_id, price_range, establishment_type_id);

-- RPC function to get facets for a specific location
CREATE OR REPLACE FUNCTION get_facets_for_location(
    target_city_id INTEGER DEFAULT NULL,
    user_lat DOUBLE PRECISION DEFAULT NULL,
    user_lng DOUBLE PRECISION DEFAULT NULL,
    radius_km DOUBLE PRECISION DEFAULT 10
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- If city_id is provided, use city-based facets
    IF target_city_id IS NOT NULL THEN
        SELECT json_build_object(
            'cuisines', json_agg(DISTINCT jsonb_build_object(
                'id', cuisine_type_id,
                'name', cuisine_name,
                'icon', cuisine_icon,
                'count', restaurant_count
            )) FILTER (WHERE cuisine_type_id IS NOT NULL),
            'price_ranges', json_agg(DISTINCT jsonb_build_object(
                'value', price_range,
                'count', restaurant_count
            )) FILTER (WHERE price_range IS NOT NULL),
            'establishment_types', json_agg(DISTINCT jsonb_build_object(
                'id', establishment_type_id,
                'name', establishment_type_name,
                'icon', establishment_type_icon,
                'count', restaurant_count
            )) FILTER (WHERE establishment_type_id IS NOT NULL),
            'diet_categories', json_build_object(
                'vegetarian', COALESCE(SUM(vegetarian_restaurants), 0),
                'vegan', COALESCE(SUM(vegan_restaurants), 0),
                'gluten_free', COALESCE(SUM(glutenfree_restaurants), 0),
                'healthy', COALESCE(SUM(healthy_restaurants), 0)
            ),
            'last_updated', MAX(last_updated)
        )
        INTO result
        FROM mv_facets_city
        WHERE city_id = target_city_id;
    ELSE
        -- Use global facets as fallback
        SELECT json_build_object(
            'cuisines', json_agg(DISTINCT jsonb_build_object(
                'id', cuisine_type_id,
                'name', cuisine_name,
                'icon', cuisine_icon,
                'count', restaurant_count
            )) FILTER (WHERE cuisine_type_id IS NOT NULL),
            'price_ranges', json_agg(DISTINCT jsonb_build_object(
                'value', price_range,
                'count', restaurant_count
            )) FILTER (WHERE price_range IS NOT NULL),
            'establishment_types', json_agg(DISTINCT jsonb_build_object(
                'id', establishment_type_id,
                'name', establishment_type_name,
                'icon', establishment_type_icon,
                'count', restaurant_count
            )) FILTER (WHERE establishment_type_id IS NOT NULL),
            'diet_categories', json_build_object(
                'vegetarian', COALESCE(SUM(vegetarian_restaurants), 0),
                'vegan', COALESCE(SUM(vegan_restaurants), 0),
                'gluten_free', COALESCE(SUM(glutenfree_restaurants), 0),
                'healthy', COALESCE(SUM(healthy_restaurants), 0)
            ),
            'last_updated', MAX(last_updated)
        )
        INTO result
        FROM mv_facets_global;
    END IF;

    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Manual refresh function
CREATE OR REPLACE FUNCTION refresh_mv_facets() RETURNS TEXT AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_facets_city;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_facets_global;
    RETURN 'Materialized views refreshed successfully at ' || CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up pg_cron job to refresh every 5 minutes
SELECT cron.schedule(
    'refresh-facets-mv',
    '*/5 * * * *', -- Every 5 minutes
    'SELECT refresh_mv_facets();'
);

-- Initial refresh to populate the materialized views
SELECT refresh_mv_facets();

-- FALLBACK: If pg_cron is not available, use this manual script:
-- Run this periodically to refresh the materialized views:
-- SELECT refresh_mv_facets();
-- 
-- Or refresh individually:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_facets_city;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_facets_global;
