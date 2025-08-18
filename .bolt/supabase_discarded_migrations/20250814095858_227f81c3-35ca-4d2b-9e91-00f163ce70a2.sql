
-- Primero necesitamos verificar que existe el restaurante y sus relaciones
-- Si no existe, lo creamos
INSERT INTO restaurants (name, slug, address, phone, email, website, price_range, google_rating, google_rating_count, latitude, longitude, logo_url, cover_image_url, social_links, delivery_links, is_active, is_published, favorites_count, favorites_count_week, favorites_count_month)
VALUES (
  'Pizzeria Bella Napoli',
  'pizzeria-bella-napoli', 
  'Calle Gran Vía, 25, 28013 Madrid, España',
  '+34 915 123 456',
  'info@bellanapoli.es',
  'https://www.bellanapoli.es',
  'medium',
  4.7,
  284,
  40.420371,
  -3.705490,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop',
  '{"instagram": "https://instagram.com/bellanapoli_madrid", "tiktok": "https://tiktok.com/@bellanapoli_official", "facebook": "https://facebook.com/BellaNapoliMadrid"}',
  '{"glovo": "https://glovoapp.com/es/es/madrid/bella-napoli", "ubereats": "https://ubereats.com/es/madrid/store/bella-napoli/123456", "justeat": "https://just-eat.es/restaurants-bella-napoli-madrid", "deliveroo": "https://deliveroo.es/es/menu/madrid/centro/bella-napoli"}',
  true,
  true,
  156,
  23,
  89
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  price_range = EXCLUDED.price_range,
  google_rating = EXCLUDED.google_rating,
  google_rating_count = EXCLUDED.google_rating_count,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  logo_url = EXCLUDED.logo_url,
  cover_image_url = EXCLUDED.cover_image_url,
  social_links = EXCLUDED.social_links,
  delivery_links = EXCLUDED.delivery_links,
  is_active = EXCLUDED.is_active,
  is_published = EXCLUDED.is_published,
  favorites_count = EXCLUDED.favorites_count,
  favorites_count_week = EXCLUDED.favorites_count_week,
  favorites_count_month = EXCLUDED.favorites_count_month;

-- Asegurar que tiene tipo de establecimiento
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_type_id, is_primary)
SELECT r.id, ct.id, true
FROM restaurants r, cuisine_types ct
WHERE r.slug = 'pizzeria-bella-napoli' AND ct.name = 'Italiana'
ON CONFLICT (restaurant_id, cuisine_type_id) DO UPDATE SET is_primary = EXCLUDED.is_primary;

-- Verificar y crear horarios (limpiar primero los existentes)
DELETE FROM restaurant_schedules WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli');

INSERT INTO restaurant_schedules (restaurant_id, day_of_week, opening_time, closing_time, is_closed)
SELECT 
  r.id,
  days.day,
  CASE 
    WHEN days.day = 0 THEN '13:00:00'  -- Domingo
    WHEN days.day = 6 THEN '12:00:00'  -- Sábado
    ELSE '12:30:00'                    -- Lunes a Viernes
  END as opening_time,
  CASE 
    WHEN days.day = 0 THEN '23:30:00'  -- Domingo
    WHEN days.day = 6 THEN '01:00:00'  -- Sábado
    ELSE '00:00:00'                    -- Lunes a Viernes
  END as closing_time,
  false as is_closed
FROM restaurants r
CROSS JOIN generate_series(0, 6) as days(day)
WHERE r.slug = 'pizzeria-bella-napoli';

-- Limpiar galería existente e insertar nueva
DELETE FROM restaurant_gallery WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli');

INSERT INTO restaurant_gallery (restaurant_id, image_url, alt_text, caption, display_order)
SELECT 
  r.id,
  images.url,
  images.alt,
  images.caption,
  images.order_num
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop', 'Interior acogedor de Bella Napoli', 'Nuestro comedor principal con ambiente italiano auténtico', 1),
    ('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop', 'Pizza Margherita clásica', 'Nuestra famosa Pizza Margherita con ingredientes frescos', 2),
    ('https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&h=600&fit=crop', 'Horno de leña tradicional', 'Pizzas cocinadas en nuestro auténtico horno de leña', 3),
    ('https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&h=600&fit=crop', 'Pasta fresca casera', 'Elaboramos nuestra pasta diariamente con ingredientes premium', 4),
    ('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop', 'Terraza exterior', 'Disfruta de nuestras especialidades en nuestra terraza', 5),
    ('https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=800&h=600&fit=crop', 'Selección de antipasti', 'Variedad de entrantes italianos tradicionales', 6)
) as images(url, alt, caption, order_num)
WHERE r.slug = 'pizzeria-bella-napoli';

-- Verificar que existe el enum price_range con el valor 'medium'
-- Si no existe, necesitamos usar un valor válido
DO $$
BEGIN
  -- Intentar actualizar con un valor que sabemos que existe
  UPDATE restaurants 
  SET price_range = 'bajo'::price_range
  WHERE slug = 'pizzeria-bella-napoli';
EXCEPTION
  WHEN others THEN
    -- Si 'bajo' no existe, usar el primer valor disponible del enum
    UPDATE restaurants 
    SET price_range = 'low'::price_range
    WHERE slug = 'pizzeria-bella-napoli';
END$$;
