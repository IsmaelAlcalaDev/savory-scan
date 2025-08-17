/*
  # Create search_restaurant_feed RPC function

  This migration creates the missing search_restaurant_feed function that the frontend is calling.
  This function provides an optimized restaurant search with diet filtering capabilities.

  ## Changes
  1. Create search_restaurant_feed function with proper parameters
  2. Grant execute permissions to anon and authenticated roles
*/

-- Create the search_restaurant_feed function that the frontend expects
CREATE OR REPLACE FUNCTION public.search_restaurant_feed(
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
  user_point geometry;
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
  
  RETURN QUERY
  SELECT 
    r.id,
    r.name::text,
    r.slug::text,
    r.description::text,
    CASE 
      WHEN user_point IS NOT NULL AND r.geom IS NOT NULL THEN
        ROUND((ST_Distance(r.geom::geography, user_point::geography) / 1000)::numeric, 2)
      ELSE NULL::numeric
    END as distance_km,
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
    COALESCE(
      (SELECT jsonb_agg(s.name)
       FROM restaurant_services rs 
       JOIN services s ON rs.service_id = s.id 
       WHERE rs.restaurant_id = r.id), 
      '[]'::jsonb
    ) as services,
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
    
    -- Distance filter
    AND (user_point IS NULL OR r.geom IS NULL OR 
         ST_DWithin(r.geom::geography, user_point::geography, max_distance_km * 1000))
    
    -- Text search filter
    AND (search_query = '' OR 
         r.name ILIKE '%' || search_query || '%' OR
         r.description ILIKE '%' || search_query || '%')
    
    -- Cuisine filter
    AND (cuisine_type_ids IS NULL OR 
         EXISTS (SELECT 1 FROM restaurant_cuisines rc 
                 WHERE rc.restaurant_id = r.id 
                 AND rc.cuisine_type_id = ANY(cuisine_type_ids)))
    
    -- Price range filter
    AND (price_ranges IS NULL OR r.price_range::text = ANY(price_ranges))
    
    -- Establishment type filter
    AND (establishment_type_ids IS NULL OR r.establishment_type_id = ANY(establishment_type_ids))
    
    -- Rating filter
    AND (min_rating IS NULL OR COALESCE(r.google_rating, 0) >= min_rating)
    
    -- Diet categories filter (restaurants with >= 20% dishes in any selected category)
    AND (diet_categories IS NULL OR EXISTS (
      SELECT 1 FROM restaurant_diet_stats rds_inner 
      WHERE rds_inner.restaurant_id = r.id 
      AND (
        ('vegetarian' = ANY(diet_categories) AND COALESCE(rds_inner.vegetarian_pct, 0) >= 20) OR
        ('vegan' = ANY(diet_categories) AND COALESCE(rds_inner.vegan_pct, 0) >= 20) OR
        ('gluten_free' = ANY(diet_categories) AND COALESCE(rds_inner.glutenfree_pct, 0) >= 20) OR
        ('healthy' = ANY(diet_categories) AND COALESCE(rds_inner.healthy_pct, 0) >= 20)
      )
    ))
    
    -- Open now filter
    AND (NOT is_open_now OR EXISTS (
      SELECT 1 FROM restaurant_schedules rs 
      WHERE rs.restaurant_id = r.id 
        AND rs.day_of_week = current_day 
        AND rs.is_closed = false
        AND rs.opening_time <= current_time
        AND rs.closing_time >= current_time
    ))
    
  ORDER BY 
    CASE 
      WHEN user_point IS NOT NULL AND search_query != '' THEN
        similarity(lower(r.name), lower(search_query))
      WHEN user_point IS NOT NULL THEN
        0 -- Will be ordered by distance via geom index
      WHEN search_query != '' THEN
        similarity(lower(r.name), lower(search_query))
      ELSE
        COALESCE(r.google_rating, 0)
    END DESC,
    CASE 
      WHEN user_point IS NOT NULL AND r.geom IS NOT NULL THEN
        r.geom <-> user_point
      ELSE
        0
    END,
    r.favorites_count DESC NULLS LAST,
    r.name
  LIMIT max_results;
END;
$$;

-- Grant execute permissions to the roles that need it
GRANT EXECUTE ON FUNCTION public.search_restaurant_feed(
  text, numeric, numeric, numeric, integer[], text[], integer[], text[], numeric, boolean, integer
) TO anon, authenticated;