
-- Agregar columna para el número de reseñas en la tabla restaurants
ALTER TABLE restaurants 
ADD COLUMN review_count INTEGER DEFAULT 0;

-- Actualizar la función search_restaurants para incluir review_count
CREATE OR REPLACE FUNCTION public.search_restaurants(
    search_query text DEFAULT ''::text, 
    user_lat numeric DEFAULT NULL::numeric, 
    user_lng numeric DEFAULT NULL::numeric, 
    max_distance_km numeric DEFAULT 10, 
    cuisine_type_ids integer[] DEFAULT NULL::integer[], 
    price_ranges price_range[] DEFAULT NULL::price_range[], 
    min_rating numeric DEFAULT 0, 
    has_services integer[] DEFAULT NULL::integer[], 
    limit_count integer DEFAULT 20, 
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    restaurant_id integer, 
    name character varying, 
    slug character varying, 
    description text, 
    price_range price_range, 
    google_rating numeric, 
    review_count integer,
    distance_km numeric, 
    cuisine_types text[], 
    establishment_type character varying
)
LANGUAGE plpgsql
STABLE
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.slug,
        r.description,
        r.price_range,
        r.google_rating,
        r.review_count,
        CASE 
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
                haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
            ELSE NULL
        END as distance,
        COALESCE(array_agg(DISTINCT ct.name) FILTER (WHERE ct.id IS NOT NULL), '{}') as cuisines,
        et.name as establishment
    FROM restaurants r
    LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
    LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
    LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
    LEFT JOIN restaurant_services rs ON r.id = rs.restaurant_id
    WHERE r.is_active = true 
      AND r.is_published = true 
      AND r.deleted_at IS NULL
      AND (search_query = '' OR 
           r.name ILIKE '%' || search_query || '%' OR
           r.description ILIKE '%' || search_query || '%' OR
           ct.name ILIKE '%' || search_query || '%')
      AND (user_lat IS NULL OR user_lng IS NULL OR 
           haversine_distance(user_lat, user_lng, r.latitude, r.longitude) <= max_distance_km)
      AND (cuisine_type_ids IS NULL OR 
           rc.cuisine_type_id = ANY(cuisine_type_ids))
      AND (price_ranges IS NULL OR 
           r.price_range = ANY(price_ranges))
      AND r.google_rating >= min_rating
      AND (has_services IS NULL OR 
           rs.service_id = ANY(has_services))
    GROUP BY r.id, r.name, r.slug, r.description, r.price_range, r.google_rating, r.review_count,
             r.latitude, r.longitude, et.name
    ORDER BY 
        CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
            haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
        ELSE 0 END ASC,
        r.google_rating DESC
    LIMIT limit_count OFFSET offset_count;
END;
$function$;
