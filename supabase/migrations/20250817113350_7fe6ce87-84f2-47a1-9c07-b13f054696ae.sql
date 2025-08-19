
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing indexes that will be replaced with better ones
DROP INDEX IF EXISTS idx_restaurants_search;
DROP INDEX IF EXISTS idx_restaurants_location;

-- Create optimized trigram indexes for autocomplete
CREATE INDEX idx_restaurants_name_trgm ON restaurants USING gin (name gin_trgm_ops);
CREATE INDEX idx_restaurants_name_search_trgm ON restaurants USING gin ((name || ' ' || COALESCE(description, '')) gin_trgm_ops);

-- Create GIST index for geographic searches with KNN
CREATE INDEX idx_restaurants_location_gist ON restaurants USING gist (ST_Point(longitude, latitude));

-- Create composite index for filtered searches
CREATE INDEX idx_restaurants_active_published ON restaurants (is_active, is_published, deleted_at) WHERE is_active = true AND is_published = true AND deleted_at IS NULL;

-- Create optimized autocomplete view (ultra-lightweight)
CREATE OR REPLACE VIEW restaurants_autocomplete AS
SELECT 
  r.id,
  r.name,
  r.slug,
  r.latitude,
  r.longitude,
  r.google_rating,
  r.price_range
FROM restaurants r
WHERE r.is_active = true 
  AND r.is_published = true 
  AND r.deleted_at IS NULL;

-- Create optimized list view with exact frontend shape
CREATE OR REPLACE VIEW restaurants_list_optimized AS
SELECT 
  r.id,
  r.name,
  r.slug,
  r.description,
  r.price_range,
  r.google_rating,
  r.google_rating_count,
  r.latitude,
  r.longitude,
  r.favorites_count,
  r.cover_image_url,
  r.logo_url,
  r.specializes_in_diet,
  r.diet_certifications,
  r.diet_percentages,
  et.name as establishment_type,
  r.establishment_type_id,
  -- Pre-aggregated cuisine types as JSON array
  COALESCE(
    (SELECT json_agg(ct.name ORDER BY rc.is_primary DESC, ct.name)
     FROM restaurant_cuisines rc 
     JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id 
     WHERE rc.restaurant_id = r.id), 
    '[]'::json
  ) as cuisine_types,
  -- Pre-aggregated services as JSON array  
  COALESCE(
    (SELECT json_agg(s.name ORDER BY s.name)
     FROM restaurant_services rs 
     JOIN services s ON rs.service_id = s.id 
     WHERE rs.restaurant_id = r.id), 
    '[]'::json
  ) as services
FROM restaurants r
LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
WHERE r.is_active = true 
  AND r.is_published = true 
  AND r.deleted_at IS NULL;

-- Create function for trigram-based intelligent search
CREATE OR REPLACE FUNCTION intelligent_restaurant_search(
  search_query text,
  search_limit integer DEFAULT 20
) RETURNS TABLE (
  id integer,
  name character varying,
  slug character varying,
  description text,
  similarity_score real
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.slug,
    r.description,
    GREATEST(
      similarity(r.name, search_query),
      similarity(COALESCE(r.description, ''), search_query),
      similarity(r.name || ' ' || COALESCE(r.description, ''), search_query)
    ) as similarity_score
  FROM restaurants r
  WHERE r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
    AND (
      r.name % search_query 
      OR r.description % search_query
      OR (r.name || ' ' || COALESCE(r.description, '')) % search_query
    )
  ORDER BY similarity_score DESC, r.favorites_count DESC
  LIMIT search_limit;
END;
$$;

-- Create function for intelligent dish search  
CREATE OR REPLACE FUNCTION intelligent_dish_search(
  search_query text,
  search_limit integer DEFAULT 30
) RETURNS TABLE (
  id integer,
  name character varying,
  description text,
  restaurant_id integer,
  restaurant_name character varying,
  restaurant_slug character varying,
  similarity_score real
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    GREATEST(
      similarity(d.name, search_query),
      similarity(COALESCE(d.description, ''), search_query),
      similarity(d.name || ' ' || COALESCE(d.description, ''), search_query)
    ) as similarity_score
  FROM dishes d
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE d.is_active = true 
    AND d.deleted_at IS NULL
    AND r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
    AND (
      d.name % search_query 
      OR d.description % search_query
      OR (d.name || ' ' || COALESCE(d.description, '')) % search_query
    )
  ORDER BY similarity_score DESC, d.favorites_count DESC
  LIMIT search_limit;
END;
$$;

-- Create KNN geographic search function
CREATE OR REPLACE FUNCTION restaurants_near_location(
  user_lat numeric,
  user_lng numeric,
  max_distance_km numeric DEFAULT 50,
  search_limit integer DEFAULT 50
) RETURNS TABLE (
  id integer,
  name character varying,
  slug character varying,
  latitude numeric,
  longitude numeric,
  distance_km numeric
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.slug,
    r.latitude,
    r.longitude,
    ST_Distance(
      ST_Point(user_lng, user_lat)::geography,
      ST_Point(r.longitude, r.latitude)::geography
    ) / 1000 as distance_km
  FROM restaurants r
  WHERE r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
    AND r.latitude IS NOT NULL 
    AND r.longitude IS NOT NULL
  ORDER BY ST_Point(r.longitude, r.latitude) <-> ST_Point(user_lng, user_lat)
  LIMIT search_limit;
END;
$$;

-- Create fast autocomplete function
CREATE OR REPLACE FUNCTION restaurants_autocomplete(
  search_query text,
  search_limit integer DEFAULT 10
) RETURNS TABLE (
  id integer,
  name character varying,
  slug character varying,
  similarity_score real
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.slug,
    similarity(r.name, search_query) as similarity_score
  FROM restaurants_autocomplete r
  WHERE r.name % search_query
  ORDER BY similarity_score DESC, r.google_rating DESC NULLS LAST
  LIMIT search_limit;
END;
$$;
