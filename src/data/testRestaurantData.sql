
-- Actualizar datos completos para Pizzeria Bella Napoli
UPDATE restaurants 
SET 
  name = 'Pizzeria Bella Napoli',
  slug = 'pizzeria-bella-napoli',
  address = 'Calle Gran Vía, 25, 28013 Madrid, España',
  phone = '+34 915 123 456',
  email = 'info@bellanapoli.es',
  website = 'https://www.bellanapoli.es',
  price_range = 'medium',
  google_rating = 4.7,
  google_rating_count = 284,
  latitude = 40.420371,
  longitude = -3.705490,
  logo_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
  cover_image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=600&fit=crop',
  social_links = '{
    "instagram": "https://instagram.com/bellanapoli_madrid",
    "tiktok": "https://tiktok.com/@bellanapoli_official",
    "facebook": "https://facebook.com/BellaNapoliMadrid"
  }',
  delivery_links = '{
    "glovo": "https://glovoapp.com/es/es/madrid/bella-napoli",
    "ubereats": "https://ubereats.com/es/madrid/store/bella-napoli/123456",
    "justeat": "https://just-eat.es/restaurants-bella-napoli-madrid",
    "deliveroo": "https://deliveroo.es/es/menu/madrid/centro/bella-napoli"
  }',
  is_active = true,
  is_published = true,
  favorites_count = 156,
  favorites_count_week = 23,
  favorites_count_month = 89
WHERE slug = 'pizzeria-bella-napoli';

-- Insertar horarios completos
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
CROSS JOIN (
  SELECT generate_series(0, 6) as day
) days
WHERE r.slug = 'pizzeria-bella-napoli'
ON CONFLICT (restaurant_id, day_of_week) DO UPDATE SET
  opening_time = EXCLUDED.opening_time,
  closing_time = EXCLUDED.closing_time,
  is_closed = EXCLUDED.is_closed;

-- Insertar galería de imágenes
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
WHERE r.slug = 'pizzeria-bella-napoli'
ON CONFLICT (restaurant_id, display_order) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  alt_text = EXCLUDED.alt_text,
  caption = EXCLUDED.caption;

-- Insertar promociones activas
INSERT INTO promotions (
  restaurant_id, 
  title, 
  description, 
  discount_type, 
  discount_value, 
  discount_label,
  valid_from, 
  valid_until, 
  conditions,
  promo_code,
  is_active
)
SELECT 
  r.id,
  promos.title,
  promos.description,
  promos.discount_type::discount_type,
  promos.discount_value,
  promos.discount_label,
  promos.valid_from::timestamp with time zone,
  promos.valid_until::timestamp with time zone,
  promos.conditions,
  promos.promo_code,
  true
FROM restaurants r
CROSS JOIN (
  VALUES 
    (
      '2 Pizzas por 15€',
      'Llévate dos pizzas medianas de nuestra selección especial por solo 15€. Perfectas para compartir en familia.',
      'fixed_amount',
      10.00,
      '15€',
      '2024-01-01 00:00:00',
      '2024-12-31 23:59:59',
      'Válido solo para pizzas medianas de la selección especial. No acumulable con otras ofertas.',
      'PIZZA2X15',
      true
    ),
    (
      'Menú Pareja - 20% OFF',
      'Menú especial para dos personas: 2 pizzas + 2 bebidas + postre para compartir con 20% de descuento.',
      'percentage',
      20.00,
      '20% OFF',
      '2024-01-01 00:00:00',
      '2024-06-30 23:59:59',
      'Disponible de martes a jueves. Incluye pizzas medianas, bebidas y tiramisú.',
      'PAREJA20',
      true
    ),
    (
      'Happy Hour Aperitivo',
      'De 18:00 a 20:00 todos los días: Aperol Spritz + Bruschetta por solo 8€',
      'fixed_amount',
      5.00,
      '8€',
      '2024-01-01 00:00:00',
      '2024-12-31 23:59:59',
      'Válido de lunes a domingo de 18:00 a 20:00. Una consumición por persona.',
      'HAPPY8',
      true
    )
) as promos(title, description, discount_type, discount_value, discount_label, valid_from, valid_until, conditions, promo_code, is_active)
WHERE r.slug = 'pizzeria-bella-napoli'
ON CONFLICT DO NOTHING;

-- Insertar secciones del menú
INSERT INTO menu_sections (restaurant_id, name, description, display_order, is_active)
SELECT 
  r.id,
  sections.name,
  sections.description,
  sections.order_num,
  true
FROM restaurants r
CROSS JOIN (
  VALUES 
    ('Antipasti', 'Entrantes tradicionales italianos para abrir el apetito', 1),
    ('Pizzas Clásicas', 'Nuestras pizzas tradicionales con recetas auténticas', 2),
    ('Pizzas Especiales', 'Creaciones únicas de la casa con ingredientes premium', 3),
    ('Pasta Fresca', 'Pasta elaborada diariamente con salsas caseras', 4),
    ('Risottos', 'Arroces cremosos con ingredientes de temporada', 5),
    ('Carnes y Pescados', 'Segundos platos con carnes y pescados frescos', 6),
    ('Postres', 'Dulces tradicionales italianos para terminar', 7),
    ('Bebidas', 'Selección de vinos, cervezas y bebidas sin alcohol', 8)
) as sections(name, description, order_num)
WHERE r.slug = 'pizzeria-bella-napoli'
ON CONFLICT (restaurant_id, name) DO UPDATE SET
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- Insertar platos de ejemplo por sección
WITH restaurant_data AS (
  SELECT r.id as restaurant_id, ms.id as section_id, ms.name as section_name
  FROM restaurants r
  JOIN menu_sections ms ON ms.restaurant_id = r.id
  WHERE r.slug = 'pizzeria-bella-napoli'
)
INSERT INTO dishes (
  restaurant_id, 
  section_id, 
  category_id, 
  name, 
  description, 
  base_price,
  image_url,
  is_active,
  is_featured,
  spice_level,
  preparation_time_minutes,
  allergens,
  diet_types,
  custom_tags
)
SELECT 
  rd.restaurant_id,
  rd.section_id,
  1, -- categoria por defecto
  dishes_data.name,
  dishes_data.description,
  dishes_data.price,
  dishes_data.image_url,
  true,
  dishes_data.is_featured,
  dishes_data.spice_level,
  dishes_data.prep_time,
  dishes_data.allergens::jsonb,
  dishes_data.diet_types::jsonb,
  dishes_data.custom_tags::jsonb
FROM restaurant_data rd
CROSS JOIN (
  VALUES 
    -- Antipasti
    ('Bruschetta Clásica', 'Pan tostado con tomate fresco, albahaca y aceite de oliva virgen extra', 7.50, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop', false, 0, 10, '["gluten"]', '["vegetarian"]', '["tradicional", "entrada"]'),
    ('Antipasto Misto', 'Selección de embutidos italianos, quesos, aceitunas y vegetales marinados', 14.90, 'https://images.unsplash.com/photo-1559847844-d5ba31d6e3d3?w=400&h=300&fit=crop', true, 0, 15, '["lactose", "sulfites"]', '[]', '["compartir", "premium"]'),
    
    -- Pizzas Clásicas  
    ('Pizza Margherita', 'Salsa de tomate, mozzarella di bufala, albahaca fresca y aceite de oliva', 11.90, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', true, 0, 15, '["gluten", "lactose"]', '["vegetarian"]', '["clásica", "popular"]'),
    ('Pizza Napolitana', 'Salsa de tomate, mozzarella, anchoas, alcaparras y orégano', 13.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', false, 1, 15, '["gluten", "lactose", "fish"]', '[]', '["tradicional", "salada"]'),
    
    -- Pizzas Especiales
    ('Pizza Bella Napoli', 'Nuestra especialidad: tomate, burrata, prosciutto di Parma, rúcula y trufa', 18.90, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=300&fit=crop', true, 0, 20, '["gluten", "lactose"]', '[]', '["especial", "premium", "trufa"]'),
    ('Pizza Quattro Stagioni', 'Dividida en 4: champiñones, jamón, alcachofas y aceitunas', 15.90, 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop', false, 0, 18, '["gluten", "lactose"]', '[]', '["variada", "clásica"]'),
    
    -- Pasta Fresca
    ('Spaghetti Carbonara', 'Pasta fresca con huevo, panceta, pecorino romano y pimienta negra', 13.90, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop', true, 0, 12, '["gluten", "lactose", "eggs"]', '[]', '["cremosa", "tradicional"]'),
    ('Penne Arrabbiata', 'Pasta con salsa de tomate picante, guindilla, ajo y perejil', 11.50, 'https://images.unsplash.com/photo-1630431341973-02e1526becff?w=400&h=300&fit=crop', false, 2, 10, '["gluten"]', '["vegan"]', '["picante", "vegana"]'),
    
    -- Postres
    ('Tiramisú Casero', 'El auténtico tiramisú italiano con mascarpone, café y cacao', 6.90, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', true, 0, 5, '["gluten", "lactose", "eggs"]', '["vegetarian"]', '["casero", "tradicional"]'),
    ('Panna Cotta de Frutos Rojos', 'Cremoso postre italiano con coulis de frutos del bosque', 5.90, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop', false, 0, 5, '["lactose"]', '["vegetarian", "gluten_free"]', '["cremoso", "frutal"]')
) dishes_data(name, description, price, image_url, is_featured, spice_level, prep_time, allergens, diet_types, custom_tags)
WHERE (
  (rd.section_name = 'Antipasti' AND dishes_data.name LIKE '%Bruschetta%' OR dishes_data.name LIKE '%Antipasto%') OR
  (rd.section_name = 'Pizzas Clásicas' AND dishes_data.name IN ('Pizza Margherita', 'Pizza Napolitana')) OR
  (rd.section_name = 'Pizzas Especiales' AND dishes_data.name LIKE '%Bella Napoli%' OR dishes_data.name LIKE '%Quattro%') OR
  (rd.section_name = 'Pasta Fresca' AND dishes_data.name LIKE '%Spaghetti%' OR dishes_data.name LIKE '%Penne%') OR
  (rd.section_name = 'Postres' AND dishes_data.name LIKE '%Tiramisú%' OR dishes_data.name LIKE '%Panna%')
)
ON CONFLICT DO NOTHING;
