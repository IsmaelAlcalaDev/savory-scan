
-- A) Catálogo de filtros para platos: rangos de precio desde BD
CREATE TABLE IF NOT EXISTS public.dish_price_ranges (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  display_text VARCHAR NOT NULL,
  min_price NUMERIC,
  max_price NUMERIC,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.dish_price_ranges ENABLE ROW LEVEL SECURITY;

-- Políticas: público puede leer; admins gestionan
DROP POLICY IF EXISTS "Public can read dish_price_ranges" ON public.dish_price_ranges;
CREATE POLICY "Public can read dish_price_ranges"
  ON public.dish_price_ranges
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert dish_price_ranges" ON public.dish_price_ranges;
CREATE POLICY "Admins can insert dish_price_ranges"
  ON public.dish_price_ranges
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update dish_price_ranges" ON public.dish_price_ranges;
CREATE POLICY "Admins can update dish_price_ranges"
  ON public.dish_price_ranges
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete dish_price_ranges" ON public.dish_price_ranges;
CREATE POLICY "Admins can delete dish_price_ranges"
  ON public.dish_price_ranges
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_dish_price_ranges_order ON public.dish_price_ranges (is_active, display_order);

-- B) Favoritos de platos: deduplicación + unicidad + RLS + realtime + performance
-- Deduplicar, conservar 1 fila por (user_id, dish_id) priorizando activa y más reciente
WITH ranked AS (
  SELECT
    id,
    user_id,
    dish_id,
    is_active,
    saved_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, dish_id
      ORDER BY is_active DESC, saved_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.user_saved_dishes
),
to_delete AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM public.user_saved_dishes
WHERE id IN (SELECT id FROM to_delete);

-- Unicidad firme
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_saved_dishes_unique_user_dish'
  ) THEN
    ALTER TABLE public.user_saved_dishes
      ADD CONSTRAINT user_saved_dishes_unique_user_dish
      UNIQUE (user_id, dish_id);
  END IF;
END$$;

-- RLS estricto
ALTER TABLE public.user_saved_dishes ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas si existen
DROP POLICY IF EXISTS "usd_select_own_or_admin" ON public.user_saved_dishes;
DROP POLICY IF EXISTS "usd_insert_own" ON public.user_saved_dishes;
DROP POLICY IF EXISTS "usd_update_own_or_admin" ON public.user_saved_dishes;
DROP POLICY IF EXISTS "usd_delete_own_or_admin" ON public.user_saved_dishes;

-- Ver lo propio o admin todo
CREATE POLICY "usd_select_own_or_admin"
  ON public.user_saved_dishes
  FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Insertar lo propio (o admin)
CREATE POLICY "usd_insert_own"
  ON public.user_saved_dishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Actualizar lo propio (o admin)
CREATE POLICY "usd_update_own_or_admin"
  ON public.user_saved_dishes
  FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Borrar lo propio (o admin)
CREATE POLICY "usd_delete_own_or_admin"
  ON public.user_saved_dishes
  FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Índice para comprobaciones por ventana temporal
CREATE INDEX IF NOT EXISTS idx_usd_user_dish_savedat
  ON public.user_saved_dishes (user_id, dish_id, saved_at DESC);

-- Realtime robusto
ALTER TABLE public.user_saved_dishes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.user_saved_dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.dishes;

-- C) Endurecer toggle_dish_favorite (evitar suplantación) manteniendo firma
CREATE OR REPLACE FUNCTION public.toggle_dish_favorite(
  user_id_param uuid,
  dish_id_param integer
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
  restaurant_id_val INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF user_id_param IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Obtener restaurant_id (coherencia de datos)
  SELECT restaurant_id INTO restaurant_id_val FROM dishes WHERE id = dish_id_param;

  -- Estado actual
  SELECT is_active INTO is_currently_saved
  FROM user_saved_dishes
  WHERE user_id = auth.uid() AND dish_id = dish_id_param;

  IF is_currently_saved IS NULL THEN
    INSERT INTO user_saved_dishes (user_id, dish_id, restaurant_id, is_active, saved_at, saved_from)
    VALUES (auth.uid(), dish_id_param, restaurant_id_val, true, CURRENT_TIMESTAMP, 'toggle');
    RETURN true;
  ELSIF is_currently_saved = false THEN
    UPDATE user_saved_dishes
    SET is_active = true,
        saved_at = CURRENT_TIMESTAMP,
        unsaved_at = NULL
    WHERE user_id = auth.uid() AND dish_id = dish_id_param;
    RETURN true;
  ELSE
    UPDATE user_saved_dishes
    SET is_active = false,
        unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid() AND dish_id = dish_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- D) Contadores de favoritos en la tabla dishes: añadir month si falta
ALTER TABLE public.dishes
  ADD COLUMN IF NOT EXISTS favorites_count_month INTEGER DEFAULT 0;

-- E) Trigger para contadores de favoritos de platos (evitar inflado week/month)
CREATE OR REPLACE FUNCTION public.update_dish_favorites_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $function$
BEGIN
  -- Solo aplicamos lógica para la tabla de platos
  IF TG_TABLE_NAME = 'user_saved_dishes' THEN
    -- INSERT
    IF TG_OP = 'INSERT' THEN
      -- total activos
      IF NEW.is_active = true THEN
        UPDATE dishes 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.dish_id;
      END IF;

      -- semana (7 días) y mes (30 días): contar máximo 1 por usuario/ventana
      IF NEW.saved_at IS NOT NULL THEN
        -- Semana
        IF NEW.saved_at > (now() - interval '7 days') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM public.user_saved_dishes usd
            WHERE usd.user_id = NEW.user_id
              AND usd.dish_id = NEW.dish_id
              AND usd.id <> NEW.id
              AND usd.saved_at > (now() - interval '7 days')
          ) THEN
            UPDATE dishes 
              SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
            WHERE id = NEW.dish_id;
          END IF;
        END IF;

        -- Mes
        IF NEW.saved_at > (now() - interval '30 days') THEN
          IF NOT EXISTS (
            SELECT 1
            FROM public.user_saved_dishes usd
            WHERE usd.user_id = NEW.user_id
              AND usd.dish_id = NEW.dish_id
              AND usd.id <> NEW.id
              AND usd.saved_at > (now() - interval '30 days')
          ) THEN
            UPDATE dishes 
              SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
            WHERE id = NEW.dish_id;
          END IF;
        END IF;
      END IF;

    -- UPDATE (toggles)
    ELSIF TG_OP = 'UPDATE' THEN
      -- paso a activo
      IF OLD.is_active = false AND NEW.is_active = true THEN
        UPDATE dishes 
          SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.dish_id;

        IF NEW.saved_at IS NOT NULL THEN
          -- Semana: sumar solo si OLD.saved_at no estaba en ventana
          IF NEW.saved_at > (now() - interval '7 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '7 days')) THEN
            IF NOT EXISTS (
              SELECT 1
              FROM public.user_saved_dishes usd
              WHERE usd.user_id = NEW.user_id
                AND usd.dish_id = NEW.dish_id
                AND usd.id <> NEW.id
                AND usd.saved_at > (now() - interval '7 days')
            ) THEN
              UPDATE dishes 
                SET favorites_count_week = COALESCE(favorites_count_week, 0) + 1
              WHERE id = NEW.dish_id;
            END IF;
          END IF;

          -- Mes
          IF NEW.saved_at > (now() - interval '30 days')
             AND (OLD.saved_at IS NULL OR OLD.saved_at <= (now() - interval '30 days')) THEN
            IF NOT EXISTS (
              SELECT 1
              FROM public.user_saved_dishes usd
              WHERE usd.user_id = NEW.user_id
                AND usd.dish_id = NEW.dish_id
                AND usd.id <> NEW.id
                AND usd.saved_at > (now() - interval '30 days')
            ) THEN
              UPDATE dishes 
                SET favorites_count_month = COALESCE(favorites_count_month, 0) + 1
              WHERE id = NEW.dish_id;
            END IF;
          END IF;
        END IF;

      -- paso a inactivo
      ELSIF OLD.is_active = true AND NEW.is_active = false THEN
        UPDATE dishes 
          SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = NEW.dish_id;
        -- week/month NO se tocan al desguardar (representan usuarios únicos en ventana)
      END IF;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Crear trigger si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_dish_favorites_counters_usd'
  ) THEN
    CREATE TRIGGER trg_update_dish_favorites_counters_usd
    AFTER INSERT OR UPDATE ON public.user_saved_dishes
    FOR EACH ROW EXECUTE FUNCTION public.update_dish_favorites_counters();
  END IF;
END$$;

-- F) Recalcular contadores históricos de platos (unicidad por usuario/ventana)
-- Totales activos
UPDATE public.dishes d
SET favorites_count = COALESCE(totals.total_active, 0)
FROM (
  SELECT dish_id, COUNT(*) AS total_active
  FROM public.user_saved_dishes
  WHERE is_active = true
  GROUP BY dish_id
) totals
WHERE d.id = totals.dish_id;

-- Semana (7 días): usuarios únicos que han añadido en ventana
UPDATE public.dishes d
SET favorites_count_week = COALESCE(week_totals.user_count, 0)
FROM (
  SELECT dish_id, COUNT(DISTINCT user_id) AS user_count
  FROM public.user_saved_dishes
  WHERE saved_at > (now() - interval '7 days')
  GROUP BY dish_id
) week_totals
WHERE d.id = week_totals.dish_id;

-- Mes (30 días): usuarios únicos que han añadido en ventana
UPDATE public.dishes d
SET favorites_count_month = COALESCE(month_totals.user_count, 0)
FROM (
  SELECT dish_id, COUNT(DISTINCT user_id) AS user_count
  FROM public.user_saved_dishes
  WHERE saved_at > (now() - interval '30 days')
  GROUP BY dish_id
) month_totals
WHERE d.id = month_totals.dish_id;

-- G) RPC para búsqueda/filtrado de platos (security definer para lectura pública)
CREATE OR REPLACE FUNCTION public.search_dishes_with_filters(
  search_query TEXT DEFAULT '',
  user_lat NUMERIC DEFAULT NULL,
  user_lng NUMERIC DEFAULT NULL,
  max_distance_km NUMERIC DEFAULT 10,
  cuisine_type_ids INTEGER[] DEFAULT NULL,
  category_ids INTEGER[] DEFAULT NULL,
  diet_filters TEXT[] DEFAULT NULL,
  exclude_allergen_slugs TEXT[] DEFAULT NULL,
  price_range_ids INTEGER[] DEFAULT NULL,
  order_by VARCHAR DEFAULT 'relevance',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  dish_id INTEGER,
  dish_name VARCHAR,
  base_price NUMERIC,
  image_url VARCHAR,
  restaurant_id INTEGER,
  restaurant_name VARCHAR,
  restaurant_slug VARCHAR,
  distance_km NUMERIC,
  cuisine_types TEXT[],
  category_id INTEGER,
  category_name VARCHAR,
  is_vegetarian BOOLEAN,
  is_vegan BOOLEAN,
  is_gluten_free BOOLEAN,
  is_lactose_free BOOLEAN,
  is_healthy BOOLEAN,
  favorites_count INTEGER,
  favorites_count_week INTEGER,
  favorites_count_month INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    d.id,
    d.name,
    d.base_price,
    d.image_url,
    r.id,
    r.name,
    r.slug,
    CASE 
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
      ELSE NULL
    END AS distance_km,
    COALESCE(array_agg(DISTINCT ct.name) FILTER (WHERE ct.id IS NOT NULL), '{}') AS cuisine_types,
    dc.id AS category_id,
    dc.name AS category_name,
    d.is_vegetarian,
    d.is_vegan,
    d.is_gluten_free,
    d.is_lactose_free,
    d.is_healthy,
    COALESCE(d.favorites_count, 0) AS favorites_count,
    COALESCE(d.favorites_count_week, 0) AS favorites_count_week,
    COALESCE(d.favorites_count_month, 0) AS favorites_count_month
  FROM dishes d
  JOIN restaurants r ON d.restaurant_id = r.id
  LEFT JOIN dish_categories dc ON d.category_id = dc.id
  LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
  LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
  WHERE d.is_active = true
    AND d.deleted_at IS NULL
    AND r.is_active = true
    AND r.is_published = true
    AND r.deleted_at IS NULL
    AND (
      search_query = '' OR
      d.name ILIKE '%' || search_query || '%' OR
      d.description ILIKE '%' || search_query || '%' OR
      r.name ILIKE '%' || search_query || '%'
    )
    AND (
      user_lat IS NULL OR user_lng IS NULL OR
      haversine_distance(user_lat, user_lng, r.latitude, r.longitude) <= max_distance_km
    )
    AND (
      cuisine_type_ids IS NULL OR rc.cuisine_type_id = ANY(cuisine_type_ids)
    )
    AND (
      category_ids IS NULL OR d.category_id = ANY(category_ids)
    )
    AND (
      diet_filters IS NULL OR
      (ARRAY['vegetarian']::TEXT[] && diet_filters AND d.is_vegetarian = true) OR
      (ARRAY['vegan']::TEXT[] && diet_filters AND d.is_vegan = true) OR
      (ARRAY['gluten_free']::TEXT[] && diet_filters AND d.is_gluten_free = true) OR
      (ARRAY['lactose_free']::TEXT[] && diet_filters AND d.is_lactose_free = true) OR
      (ARRAY['healthy']::TEXT[] && diet_filters AND d.is_healthy = true)
    )
    AND (
      exclude_allergen_slugs IS NULL OR NOT (d.allergens ?| exclude_allergen_slugs)
    )
    AND (
      price_range_ids IS NULL OR EXISTS (
        SELECT 1
        FROM public.dish_price_ranges pr
        WHERE pr.id = ANY(price_range_ids)
          AND pr.is_active = true
          AND (pr.min_price IS NULL OR d.base_price >= pr.min_price)
          AND (pr.max_price IS NULL OR d.base_price <= pr.max_price)
      )
    )
  GROUP BY
    d.id, d.name, d.base_price, d.image_url,
    r.id, r.name, r.slug, r.latitude, r.longitude,
    dc.id, dc.name,
    d.is_vegetarian, d.is_vegan, d.is_gluten_free, d.is_lactose_free, d.is_healthy,
    d.favorites_count, d.favorites_count_week, d.favorites_count_month
  ORDER BY
    CASE WHEN order_by = 'distance' AND user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
      haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
    ELSE NULL END ASC NULLS LAST,
    CASE WHEN order_by = 'price_asc' THEN d.base_price END ASC NULLS LAST,
    CASE WHEN order_by = 'price_desc' THEN d.base_price END DESC NULLS LAST,
    CASE WHEN order_by = 'popularity' THEN d.favorites_count_week END DESC NULLS LAST,
    -- fallback por relevancia: popularidad semanal y nombre
    d.favorites_count_week DESC,
    d.name ASC
  LIMIT limit_count OFFSET offset_count;
END;
$function$;
