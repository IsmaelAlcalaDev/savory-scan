
-- Crear función para filtrar restaurantes por porcentaje de dieta (mínimo 20%)
CREATE OR REPLACE FUNCTION get_restaurants_by_diet_categories(
  diet_categories text[] DEFAULT '{}',
  search_query text DEFAULT '',
  user_lat numeric DEFAULT NULL,
  user_lng numeric DEFAULT NULL,
  max_distance_km numeric DEFAULT 1000,
  cuisine_type_ids integer[] DEFAULT '{}',
  price_ranges text[] DEFAULT '{}',
  is_high_rated boolean DEFAULT false,
  establishment_type_ids integer[] DEFAULT '{}',
  is_open_now boolean DEFAULT false,
  is_budget_friendly boolean DEFAULT false
)
RETURNS TABLE(
  restaurant_id integer,
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
  establishment_type character varying,
  cuisine_types jsonb,
  services jsonb,
  distance_km numeric,
  vegetarian_pct numeric,
  vegan_pct numeric,
  gluten_free_pct numeric,
  healthy_pct numeric,
  total_dishes integer
) 
LANGUAGE plpgsql
AS $$
DECLARE
  distance_filter_sql text := '';
  cuisine_filter_sql text := '';
  price_filter_sql text := '';
  establishment_filter_sql text := '';
  search_filter_sql text := '';
  high_rating_filter_sql text := '';
  budget_filter_sql text := '';
  diet_filter_sql text := '';
  full_query text;
BEGIN
  -- Construir filtro de distancia si se proporcionan coordenadas
  IF user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
    distance_filter_sql := FORMAT(
      ' AND ST_DWithin(ST_MakePoint(%s, %s)::geography, ST_MakePoint(r.longitude, r.latitude)::geography, %s * 1000)',
      user_lng, user_lat, max_distance_km
    );
  END IF;

  -- Construir filtro de búsqueda
  IF search_query != '' THEN
    search_filter_sql := FORMAT(
      ' AND (r.name ILIKE ''%%%s%%'' OR r.description ILIKE ''%%%s%%'')',
      search_query, search_query
    );
  END IF;

  -- Construir filtro de rating alto
  IF is_high_rated THEN
    high_rating_filter_sql := ' AND r.google_rating >= 4.5';
  END IF;

  -- Construir filtro budget-friendly
  IF is_budget_friendly THEN
    budget_filter_sql := ' AND r.price_range = ''€''';
  ELSIF array_length(price_ranges, 1) > 0 THEN
    price_filter_sql := FORMAT(
      ' AND r.price_range = ANY(SELECT pr.display_text FROM price_ranges pr WHERE pr.value = ANY(''%s''))',
      price_ranges
    );
  END IF;

  -- Construir filtro de tipos de cocina
  IF array_length(cuisine_type_ids, 1) > 0 THEN
    cuisine_filter_sql := FORMAT(
      ' AND EXISTS (SELECT 1 FROM restaurant_cuisines rc WHERE rc.restaurant_id = r.id AND rc.cuisine_type_id = ANY(''%s''))',
      cuisine_type_ids
    );
  END IF;

  -- Construir filtro de tipos de establecimiento
  IF array_length(establishment_type_ids, 1) > 0 THEN
    establishment_filter_sql := FORMAT(
      ' AND r.establishment_type_id = ANY(''%s'')',
      establishment_type_ids
    );
  END IF;

  -- Construir filtro de categorías de dieta (mínimo 20%)
  IF array_length(diet_categories, 1) > 0 THEN
    diet_filter_sql := ' AND (';
    FOR i IN 1..array_length(diet_categories, 1) LOOP
      IF i > 1 THEN
        diet_filter_sql := diet_filter_sql || ' OR ';
      END IF;
      
      CASE diet_categories[i]
        WHEN 'vegetarian' THEN
          diet_filter_sql := diet_filter_sql || 'diet_stats.vegetarian_pct >= 20';
        WHEN 'vegan' THEN
          diet_filter_sql := diet_filter_sql || 'diet_stats.vegan_pct >= 20';
        WHEN 'gluten_free' THEN
          diet_filter_sql := diet_filter_sql || 'diet_stats.gluten_free_pct >= 20';
        WHEN 'healthy' THEN
          diet_filter_sql := diet_filter_sql || 'diet_stats.healthy_pct >= 20';
      END CASE;
    END LOOP;
    diet_filter_sql := diet_filter_sql || ')';
  END IF;

  -- Construir query completa
  full_query := FORMAT('
    WITH diet_stats AS (
      SELECT 
        d.restaurant_id,
        COUNT(*) as total_dishes,
        ROUND(COUNT(*) FILTER (WHERE d.is_vegetarian = true) * 100.0 / COUNT(*), 2) as vegetarian_pct,
        ROUND(COUNT(*) FILTER (WHERE d.is_vegan = true) * 100.0 / COUNT(*), 2) as vegan_pct,
        ROUND(COUNT(*) FILTER (WHERE d.is_gluten_free = true) * 100.0 / COUNT(*), 2) as gluten_free_pct,
        ROUND(COUNT(*) FILTER (WHERE d.is_healthy = true) * 100.0 / COUNT(*), 2) as healthy_pct
      FROM dishes d
      WHERE d.is_active = true AND d.deleted_at IS NULL
      GROUP BY d.restaurant_id
      HAVING COUNT(*) > 0
    )
    SELECT 
      r.id as restaurant_id,
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
      et.name as establishment_type,
      COALESCE(
        (SELECT jsonb_agg(ct.name) FROM restaurant_cuisines rc 
         JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id 
         WHERE rc.restaurant_id = r.id), ''[]''::jsonb
      ) as cuisine_types,
      COALESCE(
        (SELECT jsonb_agg(s.name) FROM restaurant_services rs 
         JOIN services s ON rs.service_id = s.id 
         WHERE rs.restaurant_id = r.id), ''[]''::jsonb
      ) as services,
      %s as distance_km,
      diet_stats.vegetarian_pct,
      diet_stats.vegan_pct,
      diet_stats.gluten_free_pct,
      diet_stats.healthy_pct,
      diet_stats.total_dishes
    FROM restaurants r
    JOIN diet_stats ON r.id = diet_stats.restaurant_id
    LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
    WHERE r.is_active = true 
      AND r.is_published = true 
      AND r.deleted_at IS NULL
      %s %s %s %s %s %s %s %s
    ORDER BY %s
    LIMIT 50',
    CASE 
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        FORMAT('ST_Distance(ST_MakePoint(%s, %s)::geography, ST_MakePoint(r.longitude, r.latitude)::geography) / 1000', user_lng, user_lat)
      ELSE 'NULL'
    END,
    distance_filter_sql,
    search_filter_sql,
    high_rating_filter_sql,
    budget_filter_sql,
    price_filter_sql,
    cuisine_filter_sql,
    establishment_filter_sql,
    diet_filter_sql,
    CASE 
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        FORMAT('ST_Distance(ST_MakePoint(%s, %s)::geography, ST_MakePoint(r.longitude, r.latitude)::geography)', user_lng, user_lat)
      ELSE 'r.favorites_count DESC'
    END
  );

  RETURN QUERY EXECUTE full_query;
END;
$$;

-- Crear función para obtener contadores de categorías de dieta
CREATE OR REPLACE FUNCTION get_diet_category_counts(
  city_id integer DEFAULT NULL,
  user_lat numeric DEFAULT NULL,
  user_lng numeric DEFAULT NULL,
  radius_km numeric DEFAULT 10
)
RETURNS TABLE(
  vegetarian_count integer,
  vegan_count integer,
  gluten_free_count integer,
  healthy_count integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  location_filter text := '';
BEGIN
  -- Construir filtro de ubicación
  IF city_id IS NOT NULL THEN
    location_filter := FORMAT(' AND r.city_id = %s', city_id);
  ELSIF user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
    location_filter := FORMAT(
      ' AND ST_DWithin(ST_MakePoint(%s, %s)::geography, ST_MakePoint(r.longitude, r.latitude)::geography, %s * 1000)',
      user_lng, user_lat, radius_km
    );
  END IF;

  RETURN QUERY EXECUTE FORMAT('
    WITH diet_stats AS (
      SELECT 
        d.restaurant_id,
        COUNT(*) as total_dishes,
        COUNT(*) FILTER (WHERE d.is_vegetarian = true) * 100.0 / COUNT(*) as vegetarian_pct,
        COUNT(*) FILTER (WHERE d.is_vegan = true) * 100.0 / COUNT(*) as vegan_pct,
        COUNT(*) FILTER (WHERE d.is_gluten_free = true) * 100.0 / COUNT(*) as gluten_free_pct,
        COUNT(*) FILTER (WHERE d.is_healthy = true) * 100.0 / COUNT(*) as healthy_pct
      FROM dishes d
      JOIN restaurants r ON d.restaurant_id = r.id
      WHERE d.is_active = true 
        AND d.deleted_at IS NULL
        AND r.is_active = true 
        AND r.is_published = true 
        AND r.deleted_at IS NULL
        %s
      GROUP BY d.restaurant_id
      HAVING COUNT(*) > 0
    )
    SELECT 
      COUNT(*) FILTER (WHERE vegetarian_pct >= 20)::integer as vegetarian_count,
      COUNT(*) FILTER (WHERE vegan_pct >= 20)::integer as vegan_count,
      COUNT(*) FILTER (WHERE gluten_free_pct >= 20)::integer as gluten_free_count,
      COUNT(*) FILTER (WHERE healthy_pct >= 20)::integer as healthy_count
    FROM diet_stats',
    location_filter
  );
END;
$$;
