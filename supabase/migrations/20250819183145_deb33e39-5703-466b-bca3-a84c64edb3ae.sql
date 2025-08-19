
-- Crear índice GIST para geometría con condición WHERE
CREATE INDEX CONCURRENTLY idx_restaurants_geom_gist
  ON restaurants USING GIST (geom)
  WHERE is_active = true AND is_published = true;

-- Añadir columna para búsqueda full-text
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Crear índice GIN para búsqueda full-text
CREATE INDEX CONCURRENTLY idx_restaurants_search_vector
  ON restaurants USING GIN (search_vector);

-- Poblar la columna search_vector con datos existentes
UPDATE restaurants 
SET search_vector = to_tsvector('spanish', 
  COALESCE(name, '') || ' ' || 
  COALESCE(description, '') || ' ' ||
  COALESCE(address, '')
) 
WHERE search_vector IS NULL;

-- Crear trigger para mantener search_vector actualizado automáticamente
CREATE OR REPLACE FUNCTION update_restaurants_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('spanish', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.address, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger
DROP TRIGGER IF EXISTS trigger_update_restaurants_search_vector ON restaurants;
CREATE TRIGGER trigger_update_restaurants_search_vector
  BEFORE INSERT OR UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_restaurants_search_vector();
