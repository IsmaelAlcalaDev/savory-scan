-- Make public search functions accessible via SECURITY DEFINER and add a helper to fetch a restaurant by slug

-- 1) Public search: restaurants
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
    distance_km numeric,
    cuisine_types text[],
    establishment_type character varying
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        r.id,
        r.name,
        r.slug,
        r.description,
        r.price_range,
        r.google_rating,
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
    GROUP BY r.id, r.name, r.slug, r.description, r.price_range, r.google_rating, 
             r.latitude, r.longitude, et.name
    ORDER BY 
        CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
            haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
        ELSE 0 END ASC,
        r.google_rating DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$;

-- 2) Public helper: get restaurant by slug (basic profile fields + cuisines/services compact)
CREATE OR REPLACE FUNCTION public.get_restaurant_by_slug(p_slug text)
RETURNS TABLE(
    id integer,
    name varchar,
    slug varchar,
    description text,
    price_range price_range,
    google_rating numeric,
    google_rating_count integer,
    address varchar,
    website varchar,
    phone varchar,
    email varchar,
    logo_url varchar,
    cover_image_url varchar,
    social_links jsonb,
    delivery_links jsonb,
    cuisine_types text[],
    establishment_type varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.name,
        r.slug,
        r.description,
        r.price_range,
        r.google_rating,
        r.google_rating_count,
        r.address,
        r.website,
        r.phone,
        r.email,
        r.logo_url,
        r.cover_image_url,
        r.social_links,
        r.delivery_links,
        COALESCE(array_agg(DISTINCT ct.name) FILTER (WHERE ct.id IS NOT NULL), '{}') as cuisines,
        et.name as establishment
    FROM restaurants r
    LEFT JOIN restaurant_cuisines rc ON rc.restaurant_id = r.id
    LEFT JOIN cuisine_types ct ON ct.id = rc.cuisine_type_id
    LEFT JOIN establishment_types et ON et.id = r.establishment_type_id
    WHERE r.slug = p_slug
      AND r.is_active = true
      AND r.is_published = true
      AND r.deleted_at IS NULL
    GROUP BY r.id, r.name, r.slug, r.description, r.price_range, r.google_rating, r.google_rating_count,
             r.address, r.website, r.phone, r.email, r.logo_url, r.cover_image_url, r.social_links, r.delivery_links, et.name;
END;
$$;

-- 3) Public popular dishes for a restaurant (used in profile when menu is not available)
CREATE OR REPLACE FUNCTION public.get_popular_dishes(
    restaurant_id_param integer,
    limit_count integer DEFAULT 10
)
RETURNS TABLE(
    dish_id integer,
    dish_name varchar,
    base_price numeric,
    times_ordered integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.base_price,
        COALESCE(SUM(dm.added_to_ticket_count), 0)::INTEGER as popularity
    FROM dishes d
    LEFT JOIN dish_metrics dm ON d.id = dm.dish_id
    WHERE d.restaurant_id = restaurant_id_param 
      AND d.is_active = true 
      AND d.deleted_at IS NULL
    GROUP BY d.id, d.name, d.base_price
    ORDER BY popularity DESC, d.name ASC
    LIMIT limit_count;
END;
$$;