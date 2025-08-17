
-- Enable RLS on core tables if not already enabled
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_location_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow public read access to published restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow public read access to active dishes" ON public.dishes;
DROP POLICY IF EXISTS "Users can view own location history" ON public.search_location_history;

-- RESTAURANTS: Allow anonymous SELECT for published restaurants
CREATE POLICY "Anonymous can read published restaurants"
ON public.restaurants
FOR SELECT
USING (
  is_active = true 
  AND is_published = true 
  AND deleted_at IS NULL
);

-- RESTAURANTS: Only owners/admins can INSERT
CREATE POLICY "Owners can create restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = claimed_by
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- RESTAURANTS: Only owners/admins can UPDATE
CREATE POLICY "Owners can update restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (
  auth.uid() = claimed_by
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  auth.uid() = claimed_by
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- RESTAURANTS: Only owners/admins can DELETE (soft delete)
CREATE POLICY "Owners can delete restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (
  auth.uid() = claimed_by
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- DISHES: Allow anonymous SELECT for active dishes from published restaurants
CREATE POLICY "Anonymous can read published dishes"
ON public.dishes
FOR SELECT
USING (
  is_active = true 
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
  )
);

-- DISHES: Only restaurant owners/staff can INSERT
CREATE POLICY "Restaurant owners can create dishes"
ON public.dishes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND (
      auth.uid() = r.claimed_by
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  )
);

-- DISHES: Only restaurant owners/staff can UPDATE
CREATE POLICY "Restaurant owners can update dishes"
ON public.dishes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND (
      auth.uid() = r.claimed_by
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND (
      auth.uid() = r.claimed_by
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
      )
    )
  )
);

-- SEARCH_LOCATION_HISTORY: Users can only see their own history
CREATE POLICY "Users can view own location history"
ON public.search_location_history
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR (user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users can create location history"
ON public.search_location_history
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  OR user_id IS NULL
);

-- Anonymous users can create location history with session_id only
CREATE POLICY "Anonymous can create location history"
ON public.search_location_history
FOR INSERT
TO anon
WITH CHECK (
  user_id IS NULL 
  AND session_id IS NOT NULL
);

-- Update search_feed function to be SECURITY INVOKER (respects RLS)
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
SECURITY INVOKER  -- Respects RLS policies
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
    
  FROM restaurants r  -- This will respect RLS policies
  LEFT JOIN restaurant_rating_cache rrc ON r.id = rrc.restaurant_id
  LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id
  
  WHERE 
    -- Distance filter using ST_DWithin for efficiency
    (
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

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.search_feed TO anon;
GRANT EXECUTE ON FUNCTION public.search_feed TO authenticated;

-- Test queries to verify RLS policies work correctly
-- These should be run manually to test:

/*
-- Test 1: Anonymous user should see published restaurants
SET ROLE anon;
SELECT count(*) FROM restaurants WHERE is_published = true AND is_active = true AND deleted_at IS NULL;

-- Test 2: Anonymous user should NOT see unpublished restaurants  
SELECT count(*) FROM restaurants WHERE is_published = false;

-- Test 3: Anonymous user should see dishes from published restaurants
SELECT count(*) FROM dishes d 
JOIN restaurants r ON d.restaurant_id = r.id 
WHERE r.is_published = true AND r.is_active = true;

-- Test 4: Anonymous user cannot insert restaurants
INSERT INTO restaurants (name, slug) VALUES ('test', 'test'); -- Should fail

-- Test 5: search_feed should work for anonymous users
SELECT count(*) FROM search_feed();

-- Reset role
RESET ROLE;
*/
