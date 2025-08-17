
-- Create the optimized search_feed RPC function
CREATE OR REPLACE FUNCTION public.search_feed(
  search_query text DEFAULT '',
  user_lat numeric DEFAULT NULL,
  user_lon numeric DEFAULT NULL,
  max_distance_km numeric DEFAULT 50,
  cuisine_type_ids integer[] DEFAULT NULL,
  price_ranges text[] DEFAULT NULL,
  establishment_type_ids integer[] DEFAULT NULL,
  diet_categories text[] DEFAULT NULL,
  min_rating numeric DEFAULT NULL,
  is_open_now boolean DEFAULT false,
  max_results integer DEFAULT 50
)
RETURNS TABLE (
  id integer,
  name text,
  slug text,
  distance_km numeric,
  google_rating numeric,
  google_rating_count integer,
  price_range text,
  cover_image_url text,
  logo_url text,
  cuisine_types jsonb,
  establishment_type text,
  services jsonb,
  favorites_count integer,
  vegan_pct numeric,
  vegetarian_pct numeric,
  glutenfree_pct numeric,
  healthy_pct numeric,
  items_total integer
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  reference_point geometry;
  has_location boolean := false;
BEGIN
  -- Check if we have user location
  IF user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
    reference_point := ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326);
    has_location := true;
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.name::text,
    r.slug::text,
    CASE 
      WHEN has_location AND r.geom IS NOT NULL 
      THEN ST_Distance(reference_point::geography, r.geom::geography) / 1000.0
      ELSE NULL 
    END as distance_km,
    
    -- Use cached rating with fallback
    COALESCE(rrc.rating, r.google_rating) as google_rating,
    COALESCE(rrc.rating_count, r.google_rating_count) as google_rating_count,
    
    r.price_range::text,
    r.cover_image_url::text,
    r.logo_url::text,
    r.cuisine_types,
    r.establishment_type::text,
    r.services,
    COALESCE(r.favorites_count, 0) as favorites_count,
    
    -- Use pre-calculated diet stats (no hot calculation)
    COALESCE(rds.vegan_pct, 0) as vegan_pct,
    COALESCE(rds.vegetarian_pct, 0) as vegetarian_pct,
    COALESCE(rds.glutenfree_pct, 0) as glutenfree_pct,
    COALESCE(rds.healthy_pct, 0) as healthy_pct,
    COALESCE(rds.items_total, 0) as items_total
    
  FROM restaurants_full r
  LEFT JOIN restaurant_rating_cache rrc ON r.id = rrc.restaurant_id
  LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
  
  WHERE 
    -- Basic filters
    r.is_active = true 
    AND r.deleted_at IS NULL
    
    -- Distance filter using ST_DWithin for efficiency
    AND (
      NOT has_location 
      OR r.geom IS NULL 
      OR ST_DWithin(reference_point::geography, r.geom::geography, max_distance_km * 1000)
    )
    
    -- Text search with trigram and unaccent
    AND (
      search_query = '' 
      OR unaccent(r.name) % unaccent(search_query)
      OR unaccent(r.description) % unaccent(search_query)
    )
    
    -- Cuisine type filter
    AND (
      cuisine_type_ids IS NULL 
      OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(r.cuisine_types) as ct
        WHERE (ct->>'id')::integer = ANY(cuisine_type_ids)
      )
    )
    
    -- Price range filter
    AND (
      price_ranges IS NULL 
      OR r.price_range = ANY(price_ranges)
    )
    
    -- Establishment type filter
    AND (
      establishment_type_ids IS NULL 
      OR r.establishment_type_id = ANY(establishment_type_ids)
    )
    
    -- Rating filter using cached ratings
    AND (
      min_rating IS NULL 
      OR COALESCE(rrc.rating, r.google_rating, 0) >= min_rating
    )
    
    -- Diet category filters using pre-calculated stats
    AND (
      diet_categories IS NULL 
      OR (
        ('vegan' = ANY(diet_categories) AND COALESCE(rds.vegan_pct, 0) >= 25) OR
        ('vegetarian' = ANY(diet_categories) AND COALESCE(rds.vegetarian_pct, 0) >= 25) OR
        ('glutenfree' = ANY(diet_categories) AND COALESCE(rds.glutenfree_pct, 0) >= 25) OR
        ('healthy' = ANY(diet_categories) AND COALESCE(rds.healthy_pct, 0) >= 25)
      )
    )
  
  -- Order by distance using PostGIS KNN operator for optimal performance
  ORDER BY 
    CASE 
      WHEN has_location AND r.geom IS NOT NULL 
      THEN reference_point <-> r.geom
      ELSE r.favorites_count DESC
    END,
    r.id -- Stable secondary sort for consistent pagination
    
  LIMIT max_results;
END;
$$;

-- Create indexes for optimal performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_geom_gist 
ON restaurants USING GIST (geom);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_name_trigram 
ON restaurants USING GIN (unaccent(name) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_active_not_deleted 
ON restaurants (is_active, deleted_at) 
WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_rating_cache_restaurant_id 
ON restaurant_rating_cache (restaurant_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_diet_stats_restaurant_id 
ON restaurant_diet_stats (restaurant_id);

-- Add new feature flag for RPC feed
INSERT INTO app_settings (key, value, description, is_public) 
VALUES (
  'FF_RESTAURANTES_RPC_FEED', 
  '{"enabled": false}', 
  'Enable RPC-based restaurant feed instead of view-based queries',
  true
) ON CONFLICT (key) DO NOTHING;

-- Performance logging function for the feed
CREATE OR REPLACE FUNCTION public.log_search_feed_performance(duration_ms numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log performance sample (async, non-blocking)
  INSERT INTO analytics_events (
    event_type, 
    event_name, 
    properties
  ) VALUES (
    'performance',
    'search_feed_rpc',
    jsonb_build_object(
      'duration_ms', duration_ms,
      'timestamp', extract(epoch from now())
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- Ignore logging errors to not affect main functionality
  NULL;
END;
$$;
