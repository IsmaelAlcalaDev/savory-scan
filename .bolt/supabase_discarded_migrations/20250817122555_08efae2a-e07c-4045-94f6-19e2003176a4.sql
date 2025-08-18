
-- Create trigram indexes for location search optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for location tables
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities USING gin(lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_districts_name_trgm ON districts USING gin(lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_municipalities_name_trgm ON municipalities USING gin(lower(name) gin_trgm_ops); 
CREATE INDEX IF NOT EXISTS idx_poi_name_trgm ON points_of_interest USING gin(lower(name) gin_trgm_ops);

-- Spatial index for restaurants (if not exists)
CREATE INDEX IF NOT EXISTS idx_restaurants_geom_gist ON restaurants USING gist(geom);

-- Optimized location search RPC function
CREATE OR REPLACE FUNCTION intelligent_location_search(
  search_query text,
  search_limit integer DEFAULT 8
)
RETURNS TABLE (
  id integer,
  name text,
  type text,
  latitude numeric,
  longitude numeric,
  parent text,
  description text,
  is_famous boolean,
  similarity_score real
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH location_results AS (
    -- Cities
    SELECT 
      c.id,
      c.name::text,
      'city'::text as type,
      c.latitude,
      c.longitude,
      COALESCE(p.name || ', ' || co.name, p.name)::text as parent,
      null::text as description,
      false as is_famous,
      similarity(lower(c.name), lower(search_query)) as similarity_score,
      1 as type_priority
    FROM cities c
    JOIN provinces p ON c.province_id = p.id
    JOIN countries co ON p.country_id = co.id
    WHERE lower(c.name) % lower(search_query)
    
    UNION ALL
    
    -- Districts  
    SELECT 
      d.id,
      d.name::text,
      'district'::text as type,
      d.latitude,
      d.longitude,
      COALESCE(c.name || ', ' || p.name, c.name)::text as parent,
      d.description,
      COALESCE(d.is_famous, false) as is_famous,
      similarity(lower(d.name), lower(search_query)) as similarity_score,
      CASE WHEN d.is_famous THEN 2 ELSE 3 END as type_priority
    FROM districts d
    JOIN cities c ON d.city_id = c.id
    JOIN provinces p ON c.province_id = p.id
    WHERE lower(d.name) % lower(search_query)
    
    UNION ALL
    
    -- Municipalities
    SELECT 
      m.id,
      m.name::text,
      'municipality'::text as type,
      m.latitude,
      m.longitude,
      COALESCE(p.name || ', ' || co.name, p.name)::text as parent,
      null::text as description,
      false as is_famous,
      similarity(lower(m.name), lower(search_query)) as similarity_score,
      4 as type_priority
    FROM municipalities m
    JOIN provinces p ON m.province_id = p.id
    JOIN countries co ON p.country_id = co.id
    WHERE lower(m.name) % lower(search_query)
    
    UNION ALL
    
    -- Points of Interest (gastronomic areas only)
    SELECT 
      poi.id,
      poi.name::text,
      'poi'::text as type,
      poi.latitude,
      poi.longitude,
      CASE 
        WHEN poi.city_id IS NOT NULL THEN c.name || ', ' || p.name
        ELSE null
      END::text as parent,
      poi.description,
      false as is_famous,
      similarity(lower(poi.name), lower(search_query)) as similarity_score,
      5 as type_priority
    FROM points_of_interest poi
    LEFT JOIN cities c ON poi.city_id = c.id
    LEFT JOIN provinces p ON c.province_id = p.id
    WHERE poi.is_active = true
      AND poi.type IN ('gastronomic_area', 'food_district', 'culinary_zone', 'restaurant_cluster')
      AND lower(poi.name) % lower(search_query)
  )
  SELECT 
    lr.id,
    lr.name,
    lr.type,
    lr.latitude,
    lr.longitude,
    lr.parent,
    lr.description,
    lr.is_famous,
    lr.similarity_score
  FROM location_results lr
  WHERE lr.similarity_score > 0.1
  ORDER BY 
    lr.type_priority ASC,
    lr.is_famous DESC NULLS LAST,
    lr.similarity_score DESC,
    lr.name ASC
  LIMIT search_limit;
END;
$$;

-- Optimized restaurant search with geolocation RPC function
CREATE OR REPLACE FUNCTION search_restaurants(
  search_query text,
  user_lat numeric,
  user_lon numeric,
  max_results integer DEFAULT 20,
  max_distance_km numeric DEFAULT 50
)
RETURNS TABLE (
  id integer,
  name text,
  slug text,
  description text,
  distance_km numeric,
  similarity_score real,
  google_rating numeric,
  google_rating_count integer,
  price_range text,
  cover_image_url text,
  logo_url text,
  cuisine_types jsonb,
  establishment_type text,
  services jsonb,
  favorites_count integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_point geometry;
BEGIN
  -- Create point from user coordinates
  user_point := ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326);
  
  RETURN QUERY
  SELECT 
    r.id,
    r.name::text,
    r.slug::text,
    r.description::text,
    ROUND((ST_Distance(r.geom::geography, user_point::geography) / 1000)::numeric, 2) as distance_km,
    similarity(lower(r.name), lower(search_query)) as similarity_score,
    r.google_rating,
    r.google_rating_count,
    r.price_range::text,
    r.cover_image_url::text,
    r.logo_url::text,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('name', ct.name, 'slug', ct.slug))
       FROM restaurant_cuisines rc 
       JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id 
       WHERE rc.restaurant_id = r.id), 
      '[]'::jsonb
    ) as cuisine_types,
    et.name::text as establishment_type,
    COALESCE(r.services, '[]'::jsonb) as services,
    COALESCE(r.favorites_count, 0) as favorites_count
  FROM restaurants r
  LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
  WHERE r.is_active = true 
    AND r.is_published = true
    AND r.deleted_at IS NULL
    AND r.geom IS NOT NULL
    AND ST_DWithin(r.geom::geography, user_point::geography, max_distance_km * 1000)
    AND (
      search_query = '' 
      OR lower(r.name) % lower(search_query)
      OR lower(r.description) % lower(search_query)
    )
  ORDER BY 
    CASE WHEN search_query = '' THEN 0 ELSE similarity(lower(r.name), lower(search_query)) END DESC,
    r.geom <-> user_point,
    r.google_rating DESC NULLS LAST,
    r.favorites_count DESC NULLS LAST
  LIMIT max_results;
END;
$$;
