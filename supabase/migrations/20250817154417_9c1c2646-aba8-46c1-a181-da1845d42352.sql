
-- Crear función RPC optimizada para búsqueda de restaurantes con filtros de dieta
CREATE OR REPLACE FUNCTION search_restaurant_feed(
  p_q TEXT DEFAULT '',
  p_lat DECIMAL DEFAULT NULL,
  p_lon DECIMAL DEFAULT NULL,
  p_max_km INTEGER DEFAULT 50,
  p_cuisines INTEGER[] DEFAULT NULL,
  p_price_bands TEXT[] DEFAULT NULL,
  p_est_types INTEGER[] DEFAULT NULL,
  p_diet TEXT DEFAULT NULL, -- 'vegetarian,vegan,gluten_free,healthy'
  p_min_rating DECIMAL DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id INTEGER,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  price_range VARCHAR,
  google_rating DECIMAL,
  google_rating_count INTEGER,
  distance_km DECIMAL,
  cover_image_url VARCHAR,
  logo_url VARCHAR,
  cuisine_types JSONB,
  establishment_type VARCHAR,
  services JSONB,
  favorites_count INTEGER,
  vegan_pct INTEGER,
  vegetarian_pct INTEGER,
  glutenfree_pct INTEGER,
  healthy_pct INTEGER,
  items_total INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  diet_categories TEXT[];
  search_vector tsvector;
BEGIN
  -- Parse diet categories if provided
  IF p_diet IS NOT NULL AND p_diet != '' THEN
    diet_categories := string_to_array(p_diet, ',');
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.slug,
    r.description,
    r.price_range,
    r.google_rating,
    r.google_rating_count,
    CASE 
      WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      THEN ST_Distance(
        ST_GeogFromText('POINT(' || p_lon || ' ' || p_lat || ')'),
        ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')')
      ) / 1000.0
      ELSE NULL
    END::DECIMAL as distance_km,
    r.cover_image_url,
    r.logo_url,
    COALESCE(r.cuisine_types, '[]'::jsonb) as cuisine_types,
    et.name as establishment_type,
    COALESCE(r.services, '[]'::jsonb) as services,
    COALESCE(r.favorites_count, 0) as favorites_count,
    COALESCE(rds.vegan_pct, 0) as vegan_pct,
    COALESCE(rds.vegetarian_pct, 0) as vegetarian_pct,
    COALESCE(rds.glutenfree_pct, 0) as glutenfree_pct,
    COALESCE(rds.healthy_pct, 0) as healthy_pct,
    COALESCE(rds.items_total, 0) as items_total
  FROM restaurants r
  LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
  LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
  WHERE r.is_active = true
    AND r.deleted_at IS NULL
    -- Text search filter
    AND (
      p_q = '' OR p_q IS NULL OR
      to_tsvector('spanish', COALESCE(r.name, '') || ' ' || COALESCE(r.description, '')) 
      @@ plainto_tsquery('spanish', p_q)
    )
    -- Location filter
    AND (
      p_lat IS NULL OR p_lon IS NULL OR
      ST_DWithin(
        ST_GeogFromText('POINT(' || p_lon || ' ' || p_lat || ')'),
        ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')'),
        p_max_km * 1000
      )
    )
    -- Cuisine filter
    AND (
      p_cuisines IS NULL OR
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(r.cuisine_types) AS ct
        WHERE (ct->>'id')::INTEGER = ANY(p_cuisines)
      )
    )
    -- Price range filter
    AND (
      p_price_bands IS NULL OR
      r.price_range = ANY(p_price_bands)
    )
    -- Establishment type filter
    AND (
      p_est_types IS NULL OR
      r.establishment_type_id = ANY(p_est_types)
    )
    -- Rating filter
    AND (
      p_min_rating IS NULL OR
      r.google_rating >= p_min_rating
    )
    -- Diet filters with 20% minimum requirement
    AND (
      diet_categories IS NULL OR
      (
        ('vegetarian' = ANY(diet_categories) AND COALESCE(rds.vegetarian_pct, 0) >= 20) OR
        ('vegan' = ANY(diet_categories) AND COALESCE(rds.vegan_pct, 0) >= 20) OR
        ('gluten_free' = ANY(diet_categories) AND COALESCE(rds.glutenfree_pct, 0) >= 20) OR
        ('healthy' = ANY(diet_categories) AND COALESCE(rds.healthy_pct, 0) >= 20)
      )
    )
  ORDER BY
    -- Prioritize by text search relevance if searching
    CASE WHEN p_q IS NOT NULL AND p_q != '' THEN
      ts_rank(to_tsvector('spanish', COALESCE(r.name, '') || ' ' || COALESCE(r.description, '')), plainto_tsquery('spanish', p_q))
    ELSE 0 END DESC,
    -- Then by distance if location provided
    CASE 
      WHEN p_lat IS NOT NULL AND p_lon IS NOT NULL AND r.latitude IS NOT NULL AND r.longitude IS NOT NULL
      THEN ST_Distance(
        ST_GeogFromText('POINT(' || p_lon || ' ' || p_lat || ')'),
        ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')')
      )
      ELSE 999999999
    END,
    -- Finally by favorites as tiebreaker
    r.favorites_count DESC NULLS LAST,
    r.id
  LIMIT p_limit;
END;
$$;

-- Create indexes for optimal performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_diet_search 
ON restaurants USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_active 
ON restaurants USING gist(ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')'))
WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurant_diet_stats_percentages 
ON restaurant_diet_stats (restaurant_id, vegan_pct, vegetarian_pct, glutenfree_pct, healthy_pct);

-- Function to get diet filter counts for the UI
CREATE OR REPLACE FUNCTION get_diet_filter_counts(
  p_q TEXT DEFAULT '',
  p_lat DECIMAL DEFAULT NULL,
  p_lon DECIMAL DEFAULT NULL,
  p_max_km INTEGER DEFAULT 50,
  p_cuisines INTEGER[] DEFAULT NULL,
  p_price_bands TEXT[] DEFAULT NULL,
  p_est_types INTEGER[] DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL
)
RETURNS TABLE(
  vegetarian_count INTEGER,
  vegan_count INTEGER,
  gluten_free_count INTEGER,
  healthy_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN COALESCE(rds.vegetarian_pct, 0) >= 20 THEN 1 END)::INTEGER as vegetarian_count,
    COUNT(CASE WHEN COALESCE(rds.vegan_pct, 0) >= 20 THEN 1 END)::INTEGER as vegan_count,
    COUNT(CASE WHEN COALESCE(rds.glutenfree_pct, 0) >= 20 THEN 1 END)::INTEGER as gluten_free_count,
    COUNT(CASE WHEN COALESCE(rds.healthy_pct, 0) >= 20 THEN 1 END)::INTEGER as healthy_count
  FROM restaurants r
  LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
  LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
  WHERE r.is_active = true
    AND r.deleted_at IS NULL
    -- Apply same base filters as main search
    AND (
      p_q = '' OR p_q IS NULL OR
      to_tsvector('spanish', COALESCE(r.name, '') || ' ' || COALESCE(r.description, '')) 
      @@ plainto_tsquery('spanish', p_q)
    )
    AND (
      p_lat IS NULL OR p_lon IS NULL OR
      ST_DWithin(
        ST_GeogFromText('POINT(' || p_lon || ' ' || p_lat || ')'),
        ST_GeogFromText('POINT(' || r.longitude || ' ' || r.latitude || ')'),
        p_max_km * 1000
      )
    )
    AND (
      p_cuisines IS NULL OR
      EXISTS (
        SELECT 1 FROM jsonb_array_elements(r.cuisine_types) AS ct
        WHERE (ct->>'id')::INTEGER = ANY(p_cuisines)
      )
    )
    AND (
      p_price_bands IS NULL OR
      r.price_range = ANY(p_price_bands)
    )
    AND (
      p_est_types IS NULL OR
      r.establishment_type_id = ANY(p_est_types)
    )
    AND (
      p_min_rating IS NULL OR
      r.google_rating >= p_min_rating
    );
END;
$$;
