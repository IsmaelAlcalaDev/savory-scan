
-- Crear feature flag para auditoría de restaurantes
INSERT INTO app_settings (key, value, description, is_public) 
VALUES (
  'FF_RESTAURANTES_RPC',
  '{"enabled": false}',
  'Feature flag para sistema optimizado de restaurantes con RPC y caché',
  true
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Crear índices optimizados para la ruta de restaurantes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_audit_composite 
ON restaurants (is_active, deleted_at, favorites_count DESC, google_rating DESC, id) 
WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_audit 
ON restaurants USING GIST (ST_Point(longitude, latitude)) 
WHERE is_active = true AND deleted_at IS NULL AND longitude IS NOT NULL AND latitude IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_text_search_audit 
ON restaurants USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')))
WHERE is_active = true AND deleted_at IS NULL;

-- Vista materializada para restaurantes frecuentemente accedidos
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_restaurants_feed AS
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
  r.cover_image_url,
  r.logo_url,
  r.favorites_count,
  r.is_active,
  r.deleted_at,
  r.created_at,
  r.updated_at,
  -- Agregaciones precalculadas
  COALESCE(ct.cuisine_types, '[]'::jsonb) as cuisine_types,
  COALESCE(s.services, '[]'::jsonb) as services,
  et.name as establishment_type,
  -- Métricas de performance
  EXTRACT(EPOCH FROM NOW() - r.updated_at) as freshness_seconds
FROM restaurants r
LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
LEFT JOIN LATERAL (
  SELECT jsonb_agg(jsonb_build_object('name', ct.name, 'slug', ct.slug)) as cuisine_types
  FROM restaurant_cuisine_types rct
  JOIN cuisine_types ct ON rct.cuisine_type_id = ct.id
  WHERE rct.restaurant_id = r.id
) ct ON true
LEFT JOIN LATERAL (
  SELECT jsonb_agg(s.name) as services
  FROM restaurant_services rs
  JOIN services s ON rs.service_id = s.id
  WHERE rs.restaurant_id = r.id
) s ON true
WHERE r.is_active = true AND r.deleted_at IS NULL;

-- Índice en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_restaurants_feed_id ON mv_restaurants_feed (id);
CREATE INDEX IF NOT EXISTS idx_mv_restaurants_feed_location 
ON mv_restaurants_feed USING GIST (ST_Point(longitude, latitude)) 
WHERE longitude IS NOT NULL AND latitude IS NOT NULL;

-- Tabla para métricas de performance del feed
CREATE TABLE IF NOT EXISTS perf_feed (
  id SERIAL PRIMARY KEY,
  query_type VARCHAR(50) NOT NULL,
  duration_ms NUMERIC(10,3) NOT NULL,
  result_count INTEGER NOT NULL,
  cache_hit BOOLEAN DEFAULT false,
  filters_applied JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para métricas de performance
CREATE INDEX IF NOT EXISTS idx_perf_feed_created_at ON perf_feed (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_perf_feed_query_type ON perf_feed (query_type, created_at DESC);

-- Tabla para samples de performance (agregados diarios)
CREATE TABLE IF NOT EXISTS perf_feed_samples (
  id SERIAL PRIMARY KEY,
  sample_date DATE NOT NULL,
  query_type VARCHAR(50) NOT NULL,
  avg_duration_ms NUMERIC(10,3) NOT NULL,
  p50_duration_ms NUMERIC(10,3) NOT NULL,
  p95_duration_ms NUMERIC(10,3) NOT NULL,
  p99_duration_ms NUMERIC(10,3) NOT NULL,
  total_queries INTEGER NOT NULL,
  cache_hit_rate NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sample_date, query_type)
);

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_restaurants_feed_mv()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_restaurants_feed;
END;
$$;

-- Función para logging de performance
CREATE OR REPLACE FUNCTION log_feed_performance(duration_ms NUMERIC)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO perf_feed (query_type, duration_ms, result_count, cache_hit)
  VALUES ('restaurant_feed', duration_ms, 0, false);
EXCEPTION WHEN OTHERS THEN
  -- Silently ignore logging errors to not break the main functionality
  NULL;
END;
$$;

-- RPC optimizado para búsqueda de restaurantes
CREATE OR REPLACE FUNCTION search_restaurant_feed(
  search_query TEXT DEFAULT '',
  user_lat NUMERIC DEFAULT NULL,
  user_lon NUMERIC DEFAULT NULL,
  max_distance_km NUMERIC DEFAULT 50,
  cuisine_type_ids INTEGER[] DEFAULT NULL,
  price_ranges TEXT[] DEFAULT NULL,
  establishment_type_ids INTEGER[] DEFAULT NULL,
  diet_categories TEXT[] DEFAULT NULL,
  min_rating NUMERIC DEFAULT NULL,
  is_open_now BOOLEAN DEFAULT false,
  max_results INTEGER DEFAULT 50
)
RETURNS TABLE(
  id INTEGER,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  price_range VARCHAR,
  google_rating NUMERIC,
  google_rating_count INTEGER,
  distance_km NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  cover_image_url VARCHAR,
  logo_url VARCHAR,
  cuisine_types JSONB,
  establishment_type VARCHAR,
  services JSONB,
  favorites_count INTEGER,
  vegan_pct NUMERIC,
  vegetarian_pct NUMERIC,
  glutenfree_pct NUMERIC,
  healthy_pct NUMERIC,
  items_total INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration_ms NUMERIC;
BEGIN
  start_time := clock_timestamp();
  
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
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL AND r.longitude IS NOT NULL AND r.latitude IS NOT NULL
      THEN ST_Distance(
        ST_Point(user_lon, user_lat)::geography,
        ST_Point(r.longitude, r.latitude)::geography
      ) / 1000.0
      ELSE NULL
    END as distance_km,
    r.latitude,
    r.longitude,
    r.cover_image_url,
    r.logo_url,
    r.cuisine_types,
    r.establishment_type,
    r.services,
    r.favorites_count,
    COALESCE(diet_stats.vegan_pct, 0) as vegan_pct,
    COALESCE(diet_stats.vegetarian_pct, 0) as vegetarian_pct,
    COALESCE(diet_stats.glutenfree_pct, 0) as glutenfree_pct,
    COALESCE(diet_stats.healthy_pct, 0) as healthy_pct,
    COALESCE(diet_stats.items_total, 0) as items_total
  FROM mv_restaurants_feed r
  LEFT JOIN LATERAL (
    SELECT 
      COUNT(*) as items_total,
      ROUND(AVG(CASE WHEN d.is_vegan THEN 100 ELSE 0 END), 1) as vegan_pct,
      ROUND(AVG(CASE WHEN d.is_vegetarian THEN 100 ELSE 0 END), 1) as vegetarian_pct,
      ROUND(AVG(CASE WHEN d.is_gluten_free THEN 100 ELSE 0 END), 1) as glutenfree_pct,
      ROUND(AVG(CASE WHEN d.is_healthy THEN 100 ELSE 0 END), 1) as healthy_pct
    FROM dishes d
    WHERE d.restaurant_id = r.id AND d.is_active = true AND d.deleted_at IS NULL
  ) diet_stats ON true
  WHERE r.is_active = true 
    AND r.deleted_at IS NULL
    -- Filtro de texto
    AND (search_query = '' OR r.name ILIKE '%' || search_query || '%' 
         OR r.description ILIKE '%' || search_query || '%')
    -- Filtro de distancia
    AND (user_lat IS NULL OR user_lon IS NULL OR r.longitude IS NULL OR r.latitude IS NULL
         OR ST_DWithin(
           ST_Point(user_lon, user_lat)::geography,
           ST_Point(r.longitude, r.latitude)::geography,
           max_distance_km * 1000
         ))
    -- Filtro de rating
    AND (min_rating IS NULL OR r.google_rating >= min_rating)
    -- Filtros adicionales se pueden agregar aquí
  ORDER BY 
    CASE 
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
        ST_Distance(
          ST_Point(user_lon, user_lat)::geography,
          ST_Point(r.longitude, r.latitude)::geography
        )
      ELSE r.favorites_count DESC
    END
  LIMIT max_results;
  
  end_time := clock_timestamp();
  duration_ms := EXTRACT(milliseconds FROM end_time - start_time);
  
  -- Log performance
  PERFORM log_feed_performance(duration_ms);
END;
$$;

-- Habilitar realtime para las tablas críticas
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;
ALTER PUBLICATION supabase_realtime ADD TABLE perf_feed;
