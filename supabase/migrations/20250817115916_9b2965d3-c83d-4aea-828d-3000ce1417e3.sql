
-- Habilitar extensión PostGIS si no está habilitada
CREATE EXTENSION IF NOT EXISTS postgis;

-- Añadir columna geom a la tabla restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);

-- Rellenar la columna geom con los datos existentes de latitud y longitud
UPDATE public.restaurants 
SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE longitude IS NOT NULL 
  AND latitude IS NOT NULL 
  AND geom IS NULL;

-- Crear índice GIST para consultas espaciales eficientes
CREATE INDEX IF NOT EXISTS idx_restaurants_geom 
ON public.restaurants 
USING GIST (geom);

-- Verificar que los datos se han poblado correctamente
-- Esta consulta debería devolver el total de restaurantes con coordenadas
SELECT 
  count(*) as total_restaurants,
  count(geom) as restaurants_with_geom,
  count(CASE WHEN longitude IS NOT NULL AND latitude IS NOT NULL THEN 1 END) as restaurants_with_coords
FROM public.restaurants;
