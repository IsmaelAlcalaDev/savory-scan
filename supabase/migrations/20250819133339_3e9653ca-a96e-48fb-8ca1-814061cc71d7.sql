
-- FASE 1: LIMPIAR TABLAS Y FUNCIONES INNECESARIAS

-- 1. ELIMINAR TABLA DUPLICADA DE FAVORITOS
DROP TABLE IF EXISTS user_favorites CASCADE;

-- 2. ELIMINAR FUNCIONES INÚTILES
DROP FUNCTION IF EXISTS refresh_restaurant_diet_stats();
DROP FUNCTION IF EXISTS cleanup_rating_cache();
DROP FUNCTION IF EXISTS get_stale_rating_cache();
DROP FUNCTION IF EXISTS cleanup_old_analytics_data();
DROP FUNCTION IF EXISTS track_profile_view(integer);

-- 3. ELIMINAR VISTA MATERIALIZADA INNECESARIA
DROP MATERIALIZED VIEW IF EXISTS restaurant_diet_stats CASCADE;

-- 4. ELIMINAR TRIGGERS PROBLEMÁTICOS
DROP TRIGGER IF EXISTS dishes_diet_stats_trigger ON dishes;
DROP TRIGGER IF EXISTS restaurants_rating_cache_sync ON restaurants;

-- FASE 2: CONSOLIDAR TABLAS DE MÉTRICAS (8→1)

-- Crear tabla unificada de métricas
CREATE TABLE IF NOT EXISTS metrics (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  metric_type VARCHAR(100) NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB DEFAULT '{}',
  metric_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Índice compuesto para consultas optimizadas
  UNIQUE(entity_type, entity_id, metric_type, metric_date)
);

-- Migrar datos existentes de competitor_metrics
INSERT INTO metrics (entity_type, entity_id, metric_type, metric_value, metric_data, metric_date, created_at)
SELECT 
  'city' as entity_type,
  city_id as entity_id,
  'competitor_analysis' as metric_type,
  market_share_percentage as metric_value,
  jsonb_build_object(
    'total_restaurants', total_restaurants,
    'new_restaurants', new_restaurants,
    'avg_rating', avg_rating,
    'avg_ticket_amount', avg_ticket_amount,
    'cuisine_type_id', cuisine_type_id,
    'price_range', price_range
  ) as metric_data,
  metric_date,
  created_at
FROM competitor_metrics
WHERE city_id IS NOT NULL
ON CONFLICT (entity_type, entity_id, metric_type, metric_date) DO NOTHING;

-- Migrar datos existentes de dish_metrics
INSERT INTO metrics (entity_type, entity_id, metric_type, metric_value, metric_data, metric_date, created_at)
SELECT 
  'dish' as entity_type,
  dish_id as entity_id,
  'engagement' as metric_type,
  views_count as metric_value,
  jsonb_build_object(
    'views_count', views_count,
    'added_to_ticket_count', added_to_ticket_count,
    'shared_count', shared_count
  ) as metric_data,
  metric_date,
  created_at
FROM dish_metrics
ON CONFLICT (entity_type, entity_id, metric_type, metric_date) DO NOTHING;

-- Migrar datos existentes de restaurant_metrics
INSERT INTO metrics (entity_type, entity_id, metric_type, metric_value, metric_data, metric_date, created_at)
SELECT 
  'restaurant' as entity_type,
  restaurant_id as entity_id,
  'profile_views' as metric_type,
  profile_views as metric_value,
  jsonb_build_object(
    'profile_views', profile_views,
    'menu_views', menu_views,
    'ticket_count', ticket_count,
    'total_revenue', total_revenue,
    'avg_ticket_size', avg_ticket_size,
    'bounce_rate', bounce_rate
  ) as metric_data,
  metric_date,
  created_at
FROM restaurant_metrics
ON CONFLICT (entity_type, entity_id, metric_type, metric_date) DO NOTHING;

-- FASE 3: AÑADIR ÍNDICES CRÍTICOS FALTANTES

-- ÍNDICES GEOESPACIALES CRÍTICOS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_active 
ON restaurants USING GIST (geom)
WHERE is_active = true AND is_published = true AND deleted_at IS NULL;

-- ÍNDICES PARA FILTROS DE PLATOS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_dishes_restaurant_diet_flags 
ON dishes (restaurant_id, is_vegetarian, is_vegan, is_gluten_free, is_healthy)
WHERE is_active = true AND deleted_at IS NULL;

-- ÍNDICES PARA FAVORITOS OPTIMIZADOS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_saved_restaurants_user_active 
ON user_saved_restaurants (user_id, is_active, saved_at DESC) 
WHERE is_active = true;

-- Índice compuesto para métricas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_metrics_composite 
ON metrics (entity_type, entity_id, metric_type, metric_date DESC);

-- FASE 4: LIMPIAR REDUNDANCIAS

-- Eliminar columnas duplicadas en restaurants (si existen)
ALTER TABLE restaurants DROP COLUMN IF EXISTS gallery_images;
ALTER TABLE restaurants DROP COLUMN IF EXISTS favorites_count_week;
ALTER TABLE restaurants DROP COLUMN IF EXISTS favorites_count_month;

-- Añadir constraints faltantes
DO $$
BEGIN
  -- Constraint para coordenadas válidas
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_coordinates') THEN
    ALTER TABLE restaurants ADD CONSTRAINT check_coordinates
      CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180);
  END IF;

  -- Constraint para precio positivo
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_price_positive') THEN
    ALTER TABLE dishes ADD CONSTRAINT check_price_positive
      CHECK (base_price >= 0);
  END IF;
END $$;

-- FASE 5: ELIMINAR TABLAS CONSOLIDADAS (después de migrar datos)

-- Eliminar tablas de métricas fragmentadas
DROP TABLE IF EXISTS competitor_metrics CASCADE;
DROP TABLE IF EXISTS dish_metrics CASCADE;
DROP TABLE IF EXISTS restaurant_metrics CASCADE;

-- Limpiar tablas temporales o de caché innecesarias
DROP TABLE IF EXISTS restaurant_rating_cache CASCADE;
DROP TABLE IF EXISTS popularity_counters CASCADE;

-- Crear vista para mantener compatibilidad con queries existentes
CREATE OR REPLACE VIEW restaurant_metrics AS
SELECT 
  row_number() OVER (ORDER BY entity_id, metric_date) as id,
  entity_id as restaurant_id,
  metric_date,
  COALESCE((metric_data->>'profile_views')::integer, 0) as profile_views,
  COALESCE((metric_data->>'menu_views')::integer, 0) as menu_views,
  COALESCE((metric_data->>'ticket_count')::integer, 0) as ticket_count,
  COALESCE((metric_data->>'total_revenue')::numeric, 0) as total_revenue,
  COALESCE((metric_data->>'avg_ticket_size')::numeric, 0) as avg_ticket_size,
  COALESCE((metric_data->>'bounce_rate')::numeric, 0) as bounce_rate,
  created_at,
  created_at as updated_at
FROM metrics 
WHERE entity_type = 'restaurant' AND metric_type = 'profile_views';
