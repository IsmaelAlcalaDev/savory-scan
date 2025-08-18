
-- 1. Crear tabla de estadísticas de dieta precalculadas
CREATE TABLE IF NOT EXISTS public.restaurant_diet_stats (
  restaurant_id INTEGER PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  -- Contadores absolutos
  vegan_total INTEGER DEFAULT 0,
  vegetarian_total INTEGER DEFAULT 0,
  glutenfree_total INTEGER DEFAULT 0,
  healthy_total INTEGER DEFAULT 0,
  items_total INTEGER DEFAULT 0,
  -- Porcentajes calculados (0-100)
  vegan_pct NUMERIC(5,2) DEFAULT 0,
  vegetarian_pct NUMERIC(5,2) DEFAULT 0,
  glutenfree_pct NUMERIC(5,2) DEFAULT 0,
  healthy_pct NUMERIC(5,2) DEFAULT 0,
  -- Metadatos
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índices para consultas de porcentaje optimizadas
CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_vegan_pct 
ON restaurant_diet_stats (vegan_pct) WHERE vegan_pct > 0;

CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_vegetarian_pct 
ON restaurant_diet_stats (vegetarian_pct) WHERE vegetarian_pct > 0;

CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_glutenfree_pct 
ON restaurant_diet_stats (glutenfree_pct) WHERE glutenfree_pct > 0;

CREATE INDEX IF NOT EXISTS idx_restaurant_diet_stats_healthy_pct 
ON restaurant_diet_stats (healthy_pct) WHERE healthy_pct > 0;

-- 3. Función de recálculo optimizada
CREATE OR REPLACE FUNCTION recalc_diet_stats(restaurant_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
  stats_record RECORD;
BEGIN
  -- Una sola consulta para obtener todos los contadores
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN is_vegan THEN 1 ELSE 0 END) as vegan,
    SUM(CASE WHEN is_vegetarian THEN 1 ELSE 0 END) AS vegetarian,
    SUM(CASE WHEN is_gluten_free THEN 1 ELSE 0 END) AS glutenfree,
    SUM(CASE WHEN is_healthy THEN 1 ELSE 0 END) AS healthy
  INTO stats_record
  FROM dishes d
  WHERE d.restaurant_id = restaurant_id_param
    AND d.is_active = true 
    AND d.deleted_at IS NULL;

  -- UPSERT con porcentajes calculados
  INSERT INTO restaurant_diet_stats (
    restaurant_id, items_total, vegan_total, vegetarian_total, 
    glutenfree_total, healthy_total, vegan_pct, vegetarian_pct, 
    glutenfree_pct, healthy_pct, updated_at
  ) VALUES (
    restaurant_id_param,
    stats_record.total,
    stats_record.vegan,
    stats_record.vegetarian,
    stats_record.glutenfree,
    stats_record.healthy,
    CASE WHEN stats_record.total > 0 THEN ROUND((stats_record.vegan * 100.0) / stats_record.total, 2) ELSE 0 END,
    CASE WHEN stats_record.total > 0 THEN ROUND((stats_record.vegetarian * 100.0) / stats_record.total, 2) ELSE 0 END,
    CASE WHEN stats_record.total > 0 THEN ROUND((stats_record.glutenfree * 100.0) / stats_record.total, 2) ELSE 0 END,
    CASE WHEN stats_record.total > 0 THEN ROUND((stats_record.healthy * 100.0) / stats_record.total, 2) ELSE 0 END,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (restaurant_id) 
  DO UPDATE SET
    items_total = EXCLUDED.items_total,
    vegan_total = EXCLUDED.vegan_total,
    vegetarian_total = EXCLUDED.vegetarian_total,
    glutenfree_total = EXCLUDED.glutenfree_total,
    healthy_total = EXCLUDED.healthy_total,
    vegan_pct = EXCLUDED.vegan_pct,
    vegetarian_pct = EXCLUDED.vegetarian_pct,
    glutenfree_pct = EXCLUDED.glutenfree_pct,
    healthy_pct = EXCLUDED.healthy_pct,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger function que maneja INSERT/UPDATE/DELETE
CREATE OR REPLACE FUNCTION trigger_recalc_diet_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalc_diet_stats(OLD.restaurant_id);
    RETURN OLD;
  ELSE
    PERFORM recalc_diet_stats(NEW.restaurant_id);
    -- Si cambió de restaurante, recalcular el anterior también
    IF TG_OP = 'UPDATE' AND OLD.restaurant_id != NEW.restaurant_id THEN
      PERFORM recalc_diet_stats(OLD.restaurant_id);
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Aplicar triggers a la tabla dishes
DROP TRIGGER IF EXISTS dishes_diet_stats_trigger ON dishes;
CREATE TRIGGER dishes_diet_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON dishes
  FOR EACH ROW EXECUTE FUNCTION trigger_recalc_diet_stats();

-- 6. Poblar estadísticas para todos los restaurantes existentes
INSERT INTO restaurant_diet_stats (restaurant_id)
SELECT id FROM restaurants 
WHERE is_active = true AND is_published = true
ON CONFLICT (restaurant_id) DO NOTHING;

-- 7. Recalcular todas las estadísticas iniciales
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT restaurant_id FROM restaurant_diet_stats LOOP
        PERFORM recalc_diet_stats(r.restaurant_id);
    END LOOP;
END
$$;
