
-- 1. Crear tabla de cache de ratings
CREATE TABLE IF NOT EXISTS public.restaurant_rating_cache (
  restaurant_id INTEGER PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  last_sync DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices optimizados
CREATE INDEX IF NOT EXISTS idx_restaurant_rating_cache_rating 
ON restaurant_rating_cache (rating) WHERE rating IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_rating_cache_last_sync 
ON restaurant_rating_cache (last_sync);

-- Índice parcial para ratings altos (>= 4.0)
CREATE INDEX IF NOT EXISTS idx_restaurant_rating_cache_high_rating 
ON restaurant_rating_cache (restaurant_id) WHERE rating >= 4.0;

-- 3. Función para sincronizar ratings desde tabla restaurants
CREATE OR REPLACE FUNCTION sync_restaurant_rating_cache(restaurant_id_param INTEGER DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  IF restaurant_id_param IS NOT NULL THEN
    -- Sincronizar un restaurante específico
    INSERT INTO restaurant_rating_cache (
      restaurant_id, rating, rating_count, last_sync, updated_at
    )
    SELECT 
      id,
      google_rating,
      google_rating_count,
      CURRENT_DATE,
      CURRENT_TIMESTAMP
    FROM restaurants 
    WHERE id = restaurant_id_param
      AND is_active = true 
      AND is_published = true
    ON CONFLICT (restaurant_id) 
    DO UPDATE SET
      rating = EXCLUDED.rating,
      rating_count = EXCLUDED.rating_count,
      last_sync = CURRENT_DATE,
      updated_at = CURRENT_TIMESTAMP;
  ELSE
    -- Sincronizar todos los restaurantes
    INSERT INTO restaurant_rating_cache (
      restaurant_id, rating, rating_count, last_sync, updated_at
    )
    SELECT 
      id,
      google_rating,
      google_rating_count,
      CURRENT_DATE,
      CURRENT_TIMESTAMP
    FROM restaurants 
    WHERE is_active = true 
      AND is_published = true
    ON CONFLICT (restaurant_id) 
    DO UPDATE SET
      rating = EXCLUDED.rating,
      rating_count = EXCLUDED.rating_count,
      last_sync = CURRENT_DATE,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para identificar ratings que necesitan sync (más de 7 días)
CREATE OR REPLACE FUNCTION get_stale_rating_cache()
RETURNS TABLE(restaurant_id INTEGER, last_sync DATE, days_old INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rrc.restaurant_id,
    rrc.last_sync,
    (CURRENT_DATE - rrc.last_sync)::INTEGER as days_old
  FROM restaurant_rating_cache rrc
  WHERE rrc.last_sync < CURRENT_DATE - INTERVAL '7 days'
  ORDER BY rrc.last_sync ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para limpiar cache de restaurantes inactivos
CREATE OR REPLACE FUNCTION cleanup_rating_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM restaurant_rating_cache 
  WHERE restaurant_id NOT IN (
    SELECT id FROM restaurants 
    WHERE is_active = true AND is_published = true
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Poblar cache inicial con datos existentes
DO $$
BEGIN
  -- Insertar todos los restaurantes activos
  INSERT INTO restaurant_rating_cache (restaurant_id, rating, rating_count, last_sync)
  SELECT 
    id,
    google_rating,
    google_rating_count,
    COALESCE(google_rating_updated_at::DATE, CURRENT_DATE - INTERVAL '30 days')
  FROM restaurants 
  WHERE is_active = true AND is_published = true
  ON CONFLICT (restaurant_id) DO NOTHING;
  
  RAISE NOTICE 'Rating cache populated with existing restaurant data';
END
$$;

-- 7. Trigger para mantener cache actualizado cuando se actualiza restaurants
CREATE OR REPLACE FUNCTION trigger_sync_rating_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo sincronizar si cambió el rating o rating_count
  IF (TG_OP = 'UPDATE' AND 
      (OLD.google_rating IS DISTINCT FROM NEW.google_rating OR 
       OLD.google_rating_count IS DISTINCT FROM NEW.google_rating_count)) THEN
    
    PERFORM sync_restaurant_rating_cache(NEW.id);
    
  ELSIF TG_OP = 'INSERT' AND NEW.is_active = true AND NEW.is_published = true THEN
    
    PERFORM sync_restaurant_rating_cache(NEW.id);
    
  ELSIF TG_OP = 'DELETE' THEN
    
    DELETE FROM restaurant_rating_cache WHERE restaurant_id = OLD.id;
    
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS restaurants_rating_cache_sync ON restaurants;
CREATE TRIGGER restaurants_rating_cache_sync
  AFTER INSERT OR UPDATE OR DELETE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION trigger_sync_rating_cache();
