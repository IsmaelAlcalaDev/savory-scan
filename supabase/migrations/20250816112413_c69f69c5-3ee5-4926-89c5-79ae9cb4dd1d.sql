
-- Enable earthdistance extension for optimized geolocation calculations
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- Create function to calculate diet percentage for a restaurant
CREATE OR REPLACE FUNCTION calculate_diet_percentage(
    restaurant_id_param integer,
    diet_category text
) RETURNS integer AS $$
DECLARE
    total_dishes integer;
    matching_dishes integer;
BEGIN
    -- Get total active dishes for restaurant
    SELECT COUNT(*) INTO total_dishes
    FROM dishes 
    WHERE restaurant_id = restaurant_id_param 
    AND is_active = true 
    AND deleted_at IS NULL;
    
    IF total_dishes = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count dishes matching the diet category
    SELECT COUNT(*) INTO matching_dishes
    FROM dishes 
    WHERE restaurant_id = restaurant_id_param 
    AND is_active = true 
    AND deleted_at IS NULL
    AND CASE 
        WHEN diet_category = 'vegetarian' THEN is_vegetarian = true
        WHEN diet_category = 'vegan' THEN is_vegan = true
        WHEN diet_category = 'gluten_free' THEN is_gluten_free = true
        WHEN diet_category = 'healthy' THEN is_healthy = true
        ELSE false
    END;
    
    RETURN ROUND((matching_dishes::numeric / total_dishes::numeric) * 100);
END;
$$ LANGUAGE plpgsql;

-- Create function to get restaurants within distance using earthdistance
CREATE OR REPLACE FUNCTION restaurants_within_distance(
    user_lat numeric,
    user_lng numeric,
    max_distance_km numeric DEFAULT 50
) RETURNS TABLE(
    restaurant_id integer,
    distance_km numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        ROUND((point(r.longitude, r.latitude) <@> point(user_lng, user_lat))::numeric, 2) as distance_km
    FROM restaurants r
    WHERE r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
    AND r.is_active = true
    AND r.is_published = true
    AND r.deleted_at IS NULL
    AND (point(r.longitude, r.latitude) <@> point(user_lng, user_lat)) <= max_distance_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Create function to filter restaurants by diet criteria efficiently
CREATE OR REPLACE FUNCTION get_restaurants_by_diet_criteria(
    diet_type_ids integer[]
) RETURNS TABLE(restaurant_id integer) AS $$
DECLARE
    diet_record RECORD;
    valid_restaurants integer[];
BEGIN
    -- Get diet type criteria
    FOR diet_record IN 
        SELECT id, category, min_percentage, max_percentage 
        FROM diet_types 
        WHERE id = ANY(diet_type_ids)
    LOOP
        -- For each diet type, find restaurants that meet the criteria
        WITH restaurant_percentages AS (
            SELECT 
                r.id,
                calculate_diet_percentage(r.id, diet_record.category) as percentage
            FROM restaurants r
            WHERE r.is_active = true 
            AND r.is_published = true
            AND r.deleted_at IS NULL
        )
        SELECT ARRAY(
            SELECT rp.id 
            FROM restaurant_percentages rp
            WHERE rp.percentage >= diet_record.min_percentage 
            AND rp.percentage <= diet_record.max_percentage
        ) INTO valid_restaurants;
        
        -- If this is the first iteration, initialize the result
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temp_diet_results') THEN
            CREATE TEMP TABLE temp_diet_results (restaurant_id integer);
            INSERT INTO temp_diet_results SELECT unnest(valid_restaurants);
        ELSE
            -- Intersect with previous results (restaurants must meet ALL criteria)
            DELETE FROM temp_diet_results 
            WHERE restaurant_id != ALL(valid_restaurants);
        END IF;
    END LOOP;
    
    -- Return final results
    RETURN QUERY SELECT tdr.restaurant_id FROM temp_diet_results tdr;
    
    -- Clean up
    DROP TABLE IF EXISTS temp_diet_results;
END;
$$ LANGUAGE plpgsql;

-- Create optimized search function that combines all filters
CREATE OR REPLACE FUNCTION search_restaurants(
    search_query text DEFAULT NULL,
    user_lat numeric DEFAULT NULL,
    user_lng numeric DEFAULT NULL,
    max_distance_km numeric DEFAULT 50,
    cuisine_type_ids integer[] DEFAULT NULL,
    price_ranges text[] DEFAULT NULL,
    is_high_rated boolean DEFAULT false,
    establishment_type_ids integer[] DEFAULT NULL,
    diet_type_ids integer[] DEFAULT NULL,
    is_open_now boolean DEFAULT false,
    is_budget_friendly boolean DEFAULT false,
    limit_count integer DEFAULT 50
) RETURNS TABLE(
    id integer,
    name character varying,
    slug character varying,
    description text,
    price_range character varying,
    google_rating numeric,
    google_rating_count integer,
    latitude numeric,
    longitude numeric,
    favorites_count integer,
    cover_image_url character varying,
    logo_url character varying,
    establishment_type_name character varying,
    cuisine_types text[],
    services text[],
    distance_km numeric
) AS $$
DECLARE
    current_day integer;
    current_time time;
BEGIN
    -- Get current day and time for "open now" filter
    IF is_open_now THEN
        current_day := EXTRACT(DOW FROM NOW());
        current_time := CURRENT_TIME;
    END IF;
    
    RETURN QUERY
    WITH filtered_restaurants AS (
        SELECT DISTINCT r.*
        FROM restaurants r
        LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
        LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
        LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
        LEFT JOIN restaurant_schedules rs ON r.id = rs.restaurant_id
        WHERE r.is_active = true
        AND r.is_published = true
        AND r.deleted_at IS NULL
        -- Search query filter
        AND (search_query IS NULL OR (
            r.name ILIKE '%' || search_query || '%' 
            OR r.description ILIKE '%' || search_query || '%'
        ))
        -- High rated filter
        AND (NOT is_high_rated OR r.google_rating >= 4.5)
        -- Budget friendly filter (overrides price_ranges)
        AND (NOT is_budget_friendly OR r.price_range = '€')
        -- Price range filter (only if not budget friendly)
        AND (is_budget_friendly OR price_ranges IS NULL OR r.price_range = ANY(price_ranges))
        -- Cuisine type filter
        AND (cuisine_type_ids IS NULL OR rc.cuisine_type_id = ANY(cuisine_type_ids))
        -- Establishment type filter
        AND (establishment_type_ids IS NULL OR r.establishment_type_id = ANY(establishment_type_ids))
        -- Open now filter
        AND (NOT is_open_now OR (
            rs.day_of_week = current_day
            AND rs.is_closed = false
            AND rs.opening_time <= current_time
            AND rs.closing_time >= current_time
        ))
        -- Diet type filter
        AND (diet_type_ids IS NULL OR r.id IN (
            SELECT restaurant_id FROM get_restaurants_by_diet_criteria(diet_type_ids)
        ))
    ),
    restaurants_with_distance AS (
        SELECT 
            fr.*,
            CASE 
                WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND fr.latitude IS NOT NULL AND fr.longitude IS NOT NULL
                THEN ROUND((point(fr.longitude, fr.latitude) <@> point(user_lng, user_lat))::numeric, 2)
                ELSE NULL
            END as calc_distance_km
        FROM filtered_restaurants fr
    ),
    restaurants_with_aggregates AS (
        SELECT 
            rwd.*,
            et.name as establishment_type_name,
            ARRAY_AGG(DISTINCT ct.name) FILTER (WHERE ct.name IS NOT NULL) as cuisine_types_array,
            ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as services_array
        FROM restaurants_with_distance rwd
        LEFT JOIN establishment_types et ON rwd.establishment_type_id = et.id
        LEFT JOIN restaurant_cuisines rc ON rwd.id = rc.restaurant_id
        LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
        LEFT JOIN restaurant_services rs ON rwd.id = rs.restaurant_id
        LEFT JOIN services s ON rs.service_id = s.id
        WHERE (user_lat IS NULL OR user_lng IS NULL OR calc_distance_km IS NULL OR calc_distance_km <= max_distance_km)
        GROUP BY rwd.id, rwd.name, rwd.slug, rwd.description, rwd.price_range, 
                 rwd.google_rating, rwd.google_rating_count, rwd.latitude, rwd.longitude,
                 rwd.favorites_count, rwd.cover_image_url, rwd.logo_url, rwd.calc_distance_km,
                 et.name
    )
    SELECT 
        rwa.id,
        rwa.name,
        rwa.slug,
        rwa.description,
        rwa.price_range,
        rwa.google_rating,
        rwa.google_rating_count,
        rwa.latitude,
        rwa.longitude,
        rwa.favorites_count,
        rwa.cover_image_url,
        rwa.logo_url,
        rwa.establishment_type_name,
        COALESCE(rwa.cuisine_types_array, ARRAY[]::text[]) as cuisine_types,
        COALESCE(rwa.services_array, ARRAY[]::text[]) as services,
        rwa.calc_distance_km as distance_km
    FROM restaurants_with_aggregates rwa
    ORDER BY 
        CASE WHEN rwa.calc_distance_km IS NOT NULL THEN rwa.calc_distance_km ELSE 999999 END,
        rwa.google_rating DESC NULLS LAST
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING gist(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_active_published ON restaurants(is_active, is_published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON restaurants(price_range) WHERE is_active = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_restaurants_google_rating ON restaurants(google_rating) WHERE is_active = true AND is_published = true;
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_restaurant_id ON restaurant_cuisines(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_cuisines_cuisine_type_id ON restaurant_cuisines(cuisine_type_id);
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_diet ON dishes(restaurant_id, is_vegetarian, is_vegan, is_gluten_free, is_healthy) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_restaurant_schedules_lookup ON restaurant_schedules(restaurant_id, day_of_week, is_closed);
