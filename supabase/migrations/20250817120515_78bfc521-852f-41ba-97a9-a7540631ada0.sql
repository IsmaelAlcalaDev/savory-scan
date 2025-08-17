
-- 1. Habilitar extensión pg_trgm para trigrams
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Crear índice trigram para autocompletado de restaurantes
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm 
ON restaurants USING gin (lower(name) gin_trgm_ops)
WHERE is_active = true AND is_published = true AND deleted_at IS NULL;

-- 3. Crear índice tsvector para búsqueda completa de platos
CREATE INDEX IF NOT EXISTS idx_dishes_tsv 
ON dishes USING gin (to_tsvector('spanish', coalesce(name,'')||' '||coalesce(description,'')))
WHERE is_active = true AND deleted_at IS NULL;

-- 4. Función RPC optimizada para autocompletado de restaurantes
CREATE OR REPLACE FUNCTION fast_restaurant_autocomplete(
  search_query text,
  max_results int DEFAULT 10
)
RETURNS TABLE (
  id int,
  name varchar,
  slug varchar,
  similarity_score real
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    r.id,
    r.name,
    r.slug,
    similarity(lower(r.name), lower(search_query)) as similarity_score
  FROM restaurants r
  WHERE 
    r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
    AND lower(r.name) % lower(search_query)
  ORDER BY 
    similarity(lower(r.name), lower(search_query)) DESC,
    r.favorites_count DESC NULLS LAST,
    r.id
  LIMIT max_results;
$$;

-- 5. Función RPC optimizada para búsqueda de platos
CREATE OR REPLACE FUNCTION search_dishes_fulltext(
  search_query text,
  max_results int DEFAULT 30
)
RETURNS TABLE (
  id int,
  name varchar,
  description text,
  restaurant_id int,
  restaurant_name varchar,
  restaurant_slug varchar,
  base_price numeric,
  image_url varchar,
  category_name varchar,
  ts_rank real
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    d.id,
    d.name,
    d.description,
    d.restaurant_id,
    r.name as restaurant_name,
    r.slug as restaurant_slug,
    d.base_price,
    d.image_url,
    dc.name as category_name,
    ts_rank(
      to_tsvector('spanish', coalesce(d.name,'')||' '||coalesce(d.description,'')), 
      to_tsquery('spanish', search_query)
    ) as ts_rank
  FROM dishes d
  JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN dish_categories dc ON d.category_id = dc.id
  WHERE 
    d.is_active = true 
    AND d.deleted_at IS NULL
    AND r.is_active = true 
    AND r.is_published = true 
    AND r.deleted_at IS NULL
    AND to_tsvector('spanish', coalesce(d.name,'')||' '||coalesce(d.description,'')) 
        @@ to_tsquery('spanish', search_query)
  ORDER BY 
    ts_rank DESC,
    d.favorites_count DESC NULLS LAST,
    d.id
  LIMIT max_results;
$$;

-- 6. Configurar umbrales de similaridad para trigrams (opcional, mejora rendimiento)
-- Un valor más alto = menos resultados pero más precisos
-- SET pg_trgm.similarity_threshold = 0.3;
