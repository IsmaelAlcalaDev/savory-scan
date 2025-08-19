
-- Añadir columna de vector de búsqueda a la tabla restaurants
ALTER TABLE restaurants ADD COLUMN search_vector tsvector;

-- Actualizar la columna con los datos existentes usando configuración en español
UPDATE restaurants SET search_vector = to_tsvector('spanish', coalesce(name,'') || ' ' || coalesce(description,''));

-- Crear índice GIN para búsquedas eficientes de texto completo
CREATE INDEX CONCURRENTLY idx_restaurants_search_vector_gin 
ON restaurants USING GIN (search_vector);

-- Crear trigger para mantener actualizado automáticamente el search_vector
CREATE OR REPLACE FUNCTION update_restaurants_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('spanish', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger en INSERT y UPDATE
CREATE TRIGGER trigger_update_restaurants_search_vector
  BEFORE INSERT OR UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurants_search_vector();
