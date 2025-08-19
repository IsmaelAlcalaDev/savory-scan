
-- Crear función para búsqueda inteligente de restaurantes
CREATE OR REPLACE FUNCTION intelligent_restaurant_search(search_query TEXT, search_limit INTEGER DEFAULT 20)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  slug TEXT,
  description TEXT,
  similarity_score REAL
) AS $$
BEGIN
  -- Limpiar y normalizar el término de búsqueda
  search_query := LOWER(TRIM(unaccent(search_query)));
  
  RETURN QUERY
  SELECT 
    r.id,
    r.name::TEXT,
    r.slug::TEXT,
    r.description::TEXT,
    GREATEST(
      similarity(LOWER(unaccent(r.name)), search_query),
      similarity(LOWER(unaccent(COALESCE(r.description, ''))), search_query) * 0.7,
      similarity(soundex(LOWER(unaccent(r.name))), soundex(search_query)) * 0.8
    ) as similarity_score
  FROM restaurants r
  WHERE 
    r.is_active = true
    AND r.is_published = true
    AND r.deleted_at IS NULL
    AND (
      LOWER(unaccent(r.name)) % search_query
      OR LOWER(unaccent(r.name)) ILIKE '%' || search_query || '%'
      OR LOWER(unaccent(COALESCE(r.description, ''))) ILIKE '%' || search_query || '%'
      OR soundex(LOWER(unaccent(r.name))) = soundex(search_query)
      OR levenshtein(LOWER(unaccent(r.name)), search_query) <= 2
    )
  ORDER BY 
    similarity_score DESC,
    r.favorites_count DESC,
    r.google_rating DESC NULLS LAST
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Crear función para búsqueda inteligente de platos
CREATE OR REPLACE FUNCTION intelligent_dish_search(search_query TEXT, search_limit INTEGER DEFAULT 30)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  description TEXT,
  restaurant_id INTEGER,
  restaurant_name TEXT,
  restaurant_slug TEXT,
  similarity_score REAL
) AS $$
BEGIN
  -- Limpiar y normalizar el término de búsqueda
  search_query := LOWER(TRIM(unaccent(search_query)));
  
  RETURN QUERY
  SELECT 
    d.id,
    d.name::TEXT,
    d.description::TEXT,
    d.restaurant_id,
    r.name::TEXT as restaurant_name,
    r.slug::TEXT as restaurant_slug,
    GREATEST(
      similarity(LOWER(unaccent(d.name)), search_query),
      similarity(LOWER(unaccent(COALESCE(d.description, ''))), search_query) * 0.6,
      similarity(soundex(LOWER(unaccent(d.name))), soundex(search_query)) * 0.8,
      -- También buscar en tags personalizados
      CASE 
        WHEN d.custom_tags IS NOT NULL AND jsonb_array_length(d.custom_tags) > 0 THEN
          (SELECT MAX(similarity(LOWER(unaccent(tag_value::text)), search_query)) 
           FROM jsonb_array_elements_text(d.custom_tags) AS tag_value) * 0.5
        ELSE 0
      END
    ) as similarity_score
  FROM dishes d
  JOIN restaurants r ON d.restaurant_id = r.id
  WHERE 
    d.is_active = true
    AND d.deleted_at IS NULL
    AND r.is_active = true
    AND r.is_published = true
    AND r.deleted_at IS NULL
    AND (
      LOWER(unaccent(d.name)) % search_query
      OR LOWER(unaccent(d.name)) ILIKE '%' || search_query || '%'
      OR LOWER(unaccent(COALESCE(d.description, ''))) ILIKE '%' || search_query || '%'
      OR soundex(LOWER(unaccent(d.name))) = soundex(search_query)
      OR levenshtein(LOWER(unaccent(d.name)), search_query) <= 2
      -- Buscar también en custom_tags
      OR (d.custom_tags IS NOT NULL AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(d.custom_tags) AS tag
        WHERE LOWER(unaccent(tag)) ILIKE '%' || search_query || '%'
      ))
    )
  ORDER BY 
    similarity_score DESC,
    d.is_featured DESC,
    d.favorites_count DESC
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql;

-- Crear índices adicionales para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_restaurants_name_gin ON restaurants USING gin (LOWER(unaccent(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_restaurants_description_gin ON restaurants USING gin (LOWER(unaccent(description)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dishes_name_gin ON dishes USING gin (LOWER(unaccent(name)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dishes_description_gin ON dishes USING gin (LOWER(unaccent(description)) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dishes_custom_tags_gin ON dishes USING gin (custom_tags);
