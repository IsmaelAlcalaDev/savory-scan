
-- Habilitar extensiones necesarias para búsqueda avanzada
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Crear función para búsqueda inteligente de ubicaciones
CREATE OR REPLACE FUNCTION intelligent_location_search(search_query TEXT, search_limit INTEGER DEFAULT 8)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  type TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  parent TEXT,
  description TEXT,
  is_famous BOOLEAN,
  similarity_score REAL
) AS $$
BEGIN
  -- Limpiar y normalizar el término de búsqueda
  search_query := LOWER(TRIM(unaccent(search_query)));
  
  RETURN QUERY
  WITH location_results AS (
    -- Búsqueda en ciudades
    SELECT 
      c.id,
      c.name::TEXT,
      'city'::TEXT as type,
      c.latitude,
      c.longitude,
      COALESCE(p.name || ', ' || co.name, '')::TEXT as parent,
      NULL::TEXT as description,
      false as is_famous,
      GREATEST(
        similarity(LOWER(unaccent(c.name)), search_query),
        similarity(soundex(LOWER(unaccent(c.name))), soundex(search_query)) * 0.8
      ) as similarity_score
    FROM cities c
    LEFT JOIN provinces p ON c.province_id = p.id
    LEFT JOIN countries co ON p.country_id = co.id
    WHERE 
      LOWER(unaccent(c.name)) % search_query
      OR LOWER(unaccent(c.name)) ILIKE '%' || search_query || '%'
      OR soundex(LOWER(unaccent(c.name))) = soundex(search_query)
      OR levenshtein(LOWER(unaccent(c.name)), search_query) <= 2
    
    UNION ALL
    
    -- Búsqueda en municipios
    SELECT 
      m.id,
      m.name::TEXT,
      'municipality'::TEXT as type,
      m.latitude,
      m.longitude,
      COALESCE(p.name || ', ' || co.name, '')::TEXT as parent,
      NULL::TEXT as description,
      false as is_famous,
      GREATEST(
        similarity(LOWER(unaccent(m.name)), search_query),
        similarity(soundex(LOWER(unaccent(m.name))), soundex(search_query)) * 0.8
      ) as similarity_score
    FROM municipalities m
    LEFT JOIN provinces p ON m.province_id = p.id
    LEFT JOIN countries co ON p.country_id = co.id
    WHERE 
      LOWER(unaccent(m.name)) % search_query
      OR LOWER(unaccent(m.name)) ILIKE '%' || search_query || '%'
      OR soundex(LOWER(unaccent(m.name))) = soundex(search_query)
      OR levenshtein(LOWER(unaccent(m.name)), search_query) <= 2
    
    UNION ALL
    
    -- Búsqueda en distritos
    SELECT 
      d.id,
      d.name::TEXT,
      'district'::TEXT as type,
      d.latitude,
      d.longitude,
      COALESCE(c.name || ', ' || p.name, '')::TEXT as parent,
      d.description,
      d.is_famous,
      GREATEST(
        similarity(LOWER(unaccent(d.name)), search_query),
        similarity(soundex(LOWER(unaccent(d.name))), soundex(search_query)) * 0.8
      ) as similarity_score
    FROM districts d
    LEFT JOIN cities c ON d.city_id = c.id
    LEFT JOIN provinces p ON c.province_id = p.id
    WHERE 
      LOWER(unaccent(d.name)) % search_query
      OR LOWER(unaccent(d.name)) ILIKE '%' || search_query || '%'
      OR soundex(LOWER(unaccent(d.name))) = soundex(search_query)
      OR levenshtein(LOWER(unaccent(d.name)), search_query) <= 2
    
    UNION ALL
    
    -- Búsqueda en puntos de interés gastronómicos
    SELECT 
      poi.id,
      poi.name::TEXT,
      'poi'::TEXT as type,
      poi.latitude,
      poi.longitude,
      COALESCE(c.name || ', ' || p.name, '')::TEXT as parent,
      poi.description,
      false as is_famous,
      GREATEST(
        similarity(LOWER(unaccent(poi.name)), search_query),
        similarity(soundex(LOWER(unaccent(poi.name))), soundex(search_query)) * 0.8
      ) as similarity_score
    FROM points_of_interest poi
    LEFT JOIN cities c ON poi.city_id = c.id
    LEFT JOIN provinces p ON c.province_id = p.id
    WHERE 
      poi.type IN ('gastronomic_area', 'food_district', 'culinary_zone', 'restaurant_cluster')
      AND poi.is_active = true
      AND (
        LOWER(unaccent(poi.name)) % search_query
        OR LOWER(unaccent(poi.name)) ILIKE '%' || search_query || '%'
        OR soundex(LOWER(unaccent(poi.name))) = soundex(search_query)
        OR levenshtein(LOWER(unaccent(poi.name)), search_query) <= 2
      )
  )
  SELECT 
    lr.id,
    lr.name,
    lr.type,
    lr.latitude,
    lr.longitude,
    lr.parent,
    lr.description,
    lr.is_famous,
    lr.similarity_score
  FROM location_results lr
  WHERE lr.similarity_score > 0.1
  ORDER BY 
    lr.similarity_score DESC,
    CASE lr.type 
      WHEN 'city' THEN 1 
      WHEN 'district' THEN 2 
      WHEN 'municipality' THEN 3 
      WHEN 'poi' THEN 4 
    END,
    CASE WHEN lr.is_famous THEN 0 ELSE 1 END,
    lr.name
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Crear índices para mejorar el rendimiento de la búsqueda
CREATE INDEX IF NOT EXISTS idx_cities_name_gin ON cities USING gin (LOWER(unaccent(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_municipalities_name_gin ON municipalities USING gin (LOWER(unaccent(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_districts_name_gin ON districts USING gin (LOWER(unaccent(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_poi_name_gin ON points_of_interest USING gin (LOWER(unaccent(name)) gin_trgm_ops);
