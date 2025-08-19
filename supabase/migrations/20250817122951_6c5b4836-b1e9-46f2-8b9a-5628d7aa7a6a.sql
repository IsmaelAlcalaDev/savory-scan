
-- Create optimized restaurant feed RPC function
CREATE OR REPLACE FUNCTION search_restaurant_feed(
  search_query text DEFAULT '',
  user_lat numeric DEFAULT NULL,
  user_lon numeric DEFAULT NULL,
  max_distance_km numeric DEFAULT 50,
  cuisine_type_ids integer[] DEFAULT NULL,
  price_ranges text[] DEFAULT NULL,
  establishment_type_ids integer[] DEFAULT NULL,
  diet_categories text[] DEFAULT NULL, -- ['vegetarian', 'vegan', 'gluten_free', 'healthy']
  min_rating numeric DEFAULT NULL,
  is_open_now boolean DEFAULT false,
  max_results integer DEFAULT 50
)
RETURNS TABLE (
  id integer,
  name text,
  slug text,
  description text,
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
  -- Diet stats for UI display
  vegan_pct numeric,
  vegetarian_pct numeric,
  glutenfree_pct numeric,
  healthy_pct numeric,
  items_total integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_point geometry;
  diet_filter_sql text := '';
  current_day integer;
  current_time time;
BEGIN
  -- Create point from user coordinates if provided
  IF user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
    user_point := ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326);
  END IF;
  
  -- Get current day and time for open now filter
  IF is_open_now THEN
    current_day := EXTRACT(DOW FROM NOW());
    current_time := CURRENT_TIME;
  END IF;
  
  -- Build diet filter condition (20% threshold for any selected diet)
  IF diet_categories IS NOT NULL AND array_length(diet_categories, 1) > 0 THEN
    diet_filter_sql := 'AND EXISTS (
      SELECT 1 FROM restaurant_diet_stats rds 
      WHERE rds.restaurant_id = r.id 
      AND (';
    
    -- Add conditions for each selected diet category with 20% threshold
    FOR i IN 1..array_length(diet_categories, 1) LOOP
      IF i > 1 THEN
        diet_filter_sql := diet_filter_sql || ' OR ';
      END IF;
      
      CASE diet_categories[i]
        WHEN 'vegetarian' THEN
          diet_filter_sql := diet_filter_sql || 'COALESCE(rds.vegetarian_pct, 0) >= 20';
        WHEN 'vegan' THEN
          diet_filter_sql := diet_filter_sql || 'COALESCE(rds.vegan_pct, 0) >= 20';
        WHEN 'gluten_free' THEN
          diet_filter_sql := diet_filter_sql || 'COALESCE(rds.glutenfree_pct, 0) >= 20';
        WHEN 'healthy' THEN
          diet_filter_sql := diet_filter_sql || 'COALESCE(rds.healthy_pct, 0) >= 20';
      END CASE;
    END LOOP;
    
    diet_filter_sql := diet_filter_sql || '))';
  END IF;

  RETURN QUERY EXECUTE format('
    SELECT 
      r.id,
      r.name::text,
      r.slug::text,
      r.description::text,
      %s as distance_km,
      r.google_rating,
      r.google_rating_count,
      r.price_range::text,
      r.cover_image_url::text,
      r.logo_url::text,
      COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(''name'', ct.name, ''slug'', ct.slug))
         FROM restaurant_cuisines rc 
         JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id 
         WHERE rc.restaurant_id = r.id), 
        ''[]''::jsonb
      ) as cuisine_types,
      et.name::text as establishment_type,
      COALESCE(r.services, ''[]''::jsonb) as services,
      COALESCE(r.favorites_count, 0) as favorites_count,
      COALESCE(rds.vegan_pct, 0) as vegan_pct,
      COALESCE(rds.vegetarian_pct, 0) as vegetarian_pct,
      COALESCE(rds.glutenfree_pct, 0) as glutenfree_pct,
      COALESCE(rds.healthy_pct, 0) as healthy_pct,
      COALESCE(rds.items_total, 0) as items_total
    FROM restaurants r
    LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
    LEFT JOIN restaurant_diet_stats rds ON rds.restaurant_id = r.id
    WHERE r.is_active = true 
      AND r.is_published = true
      AND r.deleted_at IS NULL
      %s -- Distance filter
      %s -- Text search filter  
      %s -- Cuisine filter
      %s -- Price range filter
      %s -- Establishment type filter
      %s -- Rating filter
      %s -- Diet filter
      %s -- Open now filter
    ORDER BY %s
    LIMIT %s',
    
    -- Distance calculation
    CASE 
      WHEN user_point IS NOT NULL THEN 
        'ROUND((ST_Distance(r.geom::geography, $1::geography) / 1000)::numeric, 2)'
      ELSE 'NULL::numeric'
    END,
    
    -- Distance filter
    CASE 
      WHEN user_point IS NOT NULL THEN 
        format('AND ST_DWithin(r.geom::geography, $1::geography, %s)', max_distance_km * 1000)
      ELSE ''
    END,
    
    -- Text search filter
    CASE 
      WHEN search_query != '' THEN 
        format('AND (lower(r.name) %% %L OR lower(r.description) %% %L)', 
               lower(search_query), lower(search_query))
      ELSE ''
    END,
    
    -- Cuisine filter
    CASE 
      WHEN cuisine_type_ids IS NOT NULL THEN 
        format('AND EXISTS (SELECT 1 FROM restaurant_cuisines rc WHERE rc.restaurant_id = r.id AND rc.cuisine_type_id = ANY(%L))', 
               cuisine_type_ids)
      ELSE ''
    END,
    
    -- Price range filter  
    CASE 
      WHEN price_ranges IS NOT NULL THEN 
        format('AND r.price_range = ANY(%L)', price_ranges)
      ELSE ''
    END,
    
    -- Establishment type filter
    CASE 
      WHEN establishment_type_ids IS NOT NULL THEN 
        format('AND r.establishment_type_id = ANY(%L)', establishment_type_ids)
      ELSE ''
    END,
    
    -- Rating filter
    CASE 
      WHEN min_rating IS NOT NULL THEN 
        format('AND COALESCE(r.google_rating, 0) >= %s', min_rating)
      ELSE ''
    END,
    
    -- Diet filter (built dynamically above)
    diet_filter_sql,
    
    -- Open now filter
    CASE 
      WHEN is_open_now THEN 
        format('AND EXISTS (
          SELECT 1 FROM restaurant_schedules rs 
          WHERE rs.restaurant_id = r.id 
            AND rs.day_of_week = %s 
            AND rs.is_closed = false
            AND rs.opening_time <= %L
            AND rs.closing_time >= %L
        )', current_day, current_time, current_time)
      ELSE ''
    END,
    
    -- Order by clause
    CASE 
      WHEN user_point IS NOT NULL AND search_query != '' THEN
        'similarity(lower(r.name), lower(' || quote_literal(lower(search_query)) || ')) DESC, r.geom <-> $1, r.google_rating DESC NULLS LAST'
      WHEN user_point IS NOT NULL THEN
        'r.geom <-> $1, r.google_rating DESC NULLS LAST, r.favorites_count DESC'
      WHEN search_query != '' THEN
        'similarity(lower(r.name), lower(' || quote_literal(lower(search_query)) || ')) DESC, r.google_rating DESC NULLS LAST'
      ELSE
        'r.google_rating DESC NULLS LAST, r.favorites_count DESC, r.name'
    END,
    
    max_results
  )
  USING user_point;
END;
$$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_restaurant_id ON restaurant_diet_stats(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_percentages ON restaurant_diet_stats(vegetarian_pct, vegan_pct, glutenfree_pct, healthy_pct);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating_favorites ON restaurants(google_rating DESC NULLS LAST, favorites_count DESC) WHERE is_active = true AND is_published = true AND deleted_at IS NULL;
