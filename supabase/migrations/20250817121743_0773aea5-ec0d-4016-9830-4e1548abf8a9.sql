
-- 1. Crear índices adicionales para optimizar la función search_feed
CREATE INDEX IF NOT EXISTS idx_restaurants_geom_gist 
ON restaurants USING GIST (geom) WHERE geom IS NOT NULL;

-- Índice para búsqueda por texto con trigram
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trigram 
ON restaurants USING GIN (lower(name) gin_trgm_ops);

-- Índice para establishment_type_id
CREATE INDEX IF NOT EXISTS idx_restaurants_establishment_type 
ON restaurants (establishment_type_id) WHERE is_active = true AND is_published = true;

-- Índice compuesto para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_restaurants_active_published 
ON restaurants (is_active, is_published, establishment_type_id) 
WHERE is_active = true AND is_published = true;

-- 2. Función RPC search_feed optimizada
CREATE OR REPLACE FUNCTION public.search_feed(
  -- Geolocalización
  p_lat double precision DEFAULT NULL,
  p_lon double precision DEFAULT NULL,
  p_max_km double precision DEFAULT 5,
  
  -- Filtros básicos
  p_q text DEFAULT NULL,
  p_limit int DEFAULT 50,
  
  -- Filtros por categorías (arrays)
  p_cuisines int[] DEFAULT NULL,
  p_est_types int[] DEFAULT NULL,
  p_price_bands text[] DEFAULT NULL,
  
  -- Filtros de calidad
  p_min_rating numeric DEFAULT NULL,
  
  -- Filtros de dieta específicos
  p_diet text DEFAULT NULL,            -- 'vegan'|'vegetarian'|'glutenfree'|'healthy'
  p_diet_pct_min numeric DEFAULT NULL  -- 0..100 (porcentaje mínimo)
  
) RETURNS TABLE (
  id integer,
  name text,
  slug text,
  description text,
  price_range text,
  establishment_type text,
  cover_image_url text,
  logo_url text,
  
  -- Datos calculados
  distance_km numeric,
  rating numeric,
  rating_count integer,
  favorites_count integer,
  
  -- Información de dieta (según p_diet solicitado)
  diet_pct numeric,
  
  -- Arrays JSON parseados
  cuisine_types text[],
  services text[]
) 
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  ref_point geography;
  text_similarity_threshold constant numeric := 0.3;
BEGIN
  -- Crear punto de referencia para cálculos de distancia
  IF p_lat IS NOT NULL AND p_lon IS NOT NULL THEN
    ref_point := ST_MakePoint(p_lon, p_lat)::geography;
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.name::text,
    r.slug::text,
    r.description::text,
    r.price_range::text,
    et.name::text as establishment_type,
    r.cover_image_url::text,
    r.logo_url::text,
    
    -- Calcular distancia en km si hay coordenadas
    CASE 
      WHEN ref_point IS NOT NULL AND r.geom IS NOT NULL THEN
        ROUND((ST_Distance(r.geom, ref_point) / 1000.0)::numeric, 2)
      ELSE NULL
    END as distance_km,
    
    -- Rating con cache y fallback
    COALESCE(rrc.rating, r.google_rating) as rating,
    COALESCE(rrc.rating_count, r.google_rating_count) as rating_count,
    COALESCE(r.favorites_count, 0) as favorites_count,
    
    -- Porcentaje de dieta solicitado
    CASE 
      WHEN p_diet = 'vegan' THEN COALESCE(rds.vegan_pct, 0)
      WHEN p_diet = 'vegetarian' THEN COALESCE(rds.vegetarian_pct, 0)
      WHEN p_diet = 'glutenfree' THEN COALESCE(rds.glutenfree_pct, 0)
      WHEN p_diet = 'healthy' THEN COALESCE(rds.healthy_pct, 0)
      ELSE 0
    END as diet_pct,
    
    -- Parsear arrays JSON a text[]
    CASE 
      WHEN r.cuisine_types IS NOT NULL THEN
        ARRAY(SELECT jsonb_array_elements_text(r.cuisine_types))
      ELSE ARRAY[]::text[]
    END as cuisine_types,
    
    CASE 
      WHEN r.services IS NOT NULL THEN
        ARRAY(SELECT jsonb_array_elements_text(r.services))  
      ELSE ARRAY[]::text[]
    END as services
    
  FROM restaurants r
  LEFT JOIN restaurant_rating_cache rrc ON r.id = rrc.restaurant_id
  LEFT JOIN restaurant_diet_stats rds ON r.id = rds.restaurant_id  
  LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
  
  WHERE 
    -- Filtros básicos de estado
    r.is_active = true 
    AND r.is_published = true
    
    -- Filtro de distancia (más eficiente con ST_DWithin)
    AND (
      ref_point IS NULL 
      OR r.geom IS NULL 
      OR ST_DWithin(r.geom, ref_point, p_max_km * 1000)
    )
    
    -- Filtro de texto con trigram + ILIKE fallback
    AND (
      p_q IS NULL 
      OR similarity(lower(r.name), lower(p_q)) > text_similarity_threshold
      OR lower(r.name) ILIKE '%' || lower(p_q) || '%'
      OR lower(COALESCE(r.description, '')) ILIKE '%' || lower(p_q) || '%'
    )
    
    -- Filtro de tipos de establecimiento
    AND (
      p_est_types IS NULL 
      OR r.establishment_type_id = ANY(p_est_types::int[])
    )
    
    -- Filtro de rango de precios
    AND (
      p_price_bands IS NULL 
      OR r.price_range = ANY(p_price_bands)
    )
    
    -- Filtro de rating mínimo (usar cache con fallback)
    AND (
      p_min_rating IS NULL 
      OR COALESCE(rrc.rating, r.google_rating, 0) >= p_min_rating
    )
    
    -- Filtro de porcentaje de dieta mínimo
    AND (
      p_diet IS NULL 
      OR p_diet_pct_min IS NULL
      OR (
        CASE 
          WHEN p_diet = 'vegan' THEN COALESCE(rds.vegan_pct, 0)
          WHEN p_diet = 'vegetarian' THEN COALESCE(rds.vegetarian_pct, 0) 
          WHEN p_diet = 'glutenfree' THEN COALESCE(rds.glutenfree_pct, 0)
          WHEN p_diet = 'healthy' THEN COALESCE(rds.healthy_pct, 0)
          ELSE 0
        END
      ) >= p_diet_pct_min
    )
    
    -- Filtro de cocinas (usando overlap con array de IDs)
    AND (
      p_cuisines IS NULL
      OR EXISTS (
        SELECT 1 FROM restaurant_cuisines rc 
        WHERE rc.restaurant_id = r.id 
        AND rc.cuisine_type_id = ANY(p_cuisines)
      )
    )
  
  ORDER BY 
    CASE 
      WHEN ref_point IS NOT NULL AND r.geom IS NOT NULL THEN 
        -- Ordenar por distancia (KNN con operador <->)
        r.geom <-> ref_point
      ELSE 
        -- Ordenar por popularidad cuando no hay geolocalización
        -(COALESCE(r.favorites_count, 0) * 1000 + COALESCE(rrc.rating, r.google_rating, 0) * 100)
    END
  
  LIMIT p_limit;
END;
$$;

-- 3. Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.search_feed TO anon, authenticated;

-- 4. Comentario para documentación
COMMENT ON FUNCTION public.search_feed IS 
'Función RPC optimizada para feed principal de restaurantes con filtros avanzados de distancia, texto, cocina, precio, rating y porcentajes de dieta. Usa PostGIS para geolocalización, trigram para búsqueda de texto, y caches precalculados para máximo rendimiento.';
