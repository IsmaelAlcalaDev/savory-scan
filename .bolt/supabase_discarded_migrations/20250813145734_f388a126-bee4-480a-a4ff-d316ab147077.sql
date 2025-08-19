
-- Añadir campos faltantes para redes sociales y enlaces externos
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS tripadvisor_url TEXT,
ADD COLUMN IF NOT EXISTS thefork_url TEXT,
ADD COLUMN IF NOT EXISTS glovo_url TEXT,
ADD COLUMN IF NOT EXISTS ubereats_url TEXT,
ADD COLUMN IF NOT EXISTS justeat_url TEXT,
ADD COLUMN IF NOT EXISTS deliveroo_url TEXT,
ADD COLUMN IF NOT EXISTS social_profiles JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS booking_platforms JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS menu_links JSONB DEFAULT '{}';

-- Actualizar el restaurante existente "Bar Manolo" con datos completos
UPDATE restaurants 
SET 
  website = 'https://www.barmanolo.es',
  social_links = '{
    "facebook": "https://www.facebook.com/barmanolomadrid",
    "instagram": "https://www.instagram.com/barmanolo_madrid",
    "twitter": "https://www.twitter.com/barmanolo_mad",
    "tiktok": "https://www.tiktok.com/@barmanolomadrid"
  }',
  social_profiles = '{
    "facebook": "@barmanolomadrid",
    "instagram": "@barmanolo_madrid", 
    "twitter": "@barmanolo_mad",
    "tiktok": "@barmanolomadrid"
  }',
  tripadvisor_url = 'https://www.tripadvisor.es/Restaurant_Review-g187514-d12345678-Reviews-Bar_Manolo-Madrid.html',
  thefork_url = 'https://www.thefork.es/restaurante/bar-manolo-r123456',
  glovo_url = 'https://glovoapp.com/es/es/madrid/bar-manolo-mad/',
  ubereats_url = 'https://www.ubereats.com/es/store/bar-manolo/abc123def456',
  justeat_url = 'https://www.just-eat.es/restaurants-bar-manolo-madrid',
  deliveroo_url = 'https://deliveroo.es/menu/madrid/centro/bar-manolo',
  booking_platforms = '{
    "opentable": "https://www.opentable.es/r/bar-manolo-madrid",
    "resy": "https://resy.com/cities/mad/bar-manolo",
    "bookatable": "https://www.bookatable.es/bar-manolo-madrid"
  }',
  menu_links = '{
    "carta_digital": "https://www.barmanolo.es/carta-digital",
    "pdf_menu": "https://www.barmanolo.es/menu.pdf",
    "allergens_info": "https://www.barmanolo.es/alergenos"
  }'
WHERE slug = 'bar-manolo';

-- Insertar más restaurantes de ejemplo con datos completos
INSERT INTO restaurants (
  name, slug, description, price_range, google_rating, google_rating_count,
  address, website, phone, email, latitude, longitude,
  establishment_type_id, is_active, is_published,
  social_links, social_profiles, tripadvisor_url, thefork_url,
  glovo_url, ubereats_url, justeat_url, deliveroo_url,
  booking_platforms, menu_links, favorites_count, favorites_count_week, favorites_count_month
) VALUES 
(
  'La Taberna del Capitán', 'la-taberna-del-capitan',
  'Auténtica taberna marinera con los mejores mariscos y pescados frescos. Ambiente tradicional con más de 50 años de historia.',
  '€€', 4.6, 387,
  'Calle Mayor 42, Madrid', 'https://www.tabernaelcapitan.com',
  '+34915551234', 'info@tabernaelcapitan.com',
  40.4165, -3.7026, 2, true, true,
  '{
    "facebook": "https://www.facebook.com/tabernaelcapitan",
    "instagram": "https://www.instagram.com/taberna_capitan",
    "twitter": "https://www.twitter.com/taberna_capitan"
  }',
  '{
    "facebook": "@tabernaelcapitan",
    "instagram": "@taberna_capitan",
    "twitter": "@taberna_capitan"
  }',
  'https://www.tripadvisor.es/Restaurant_Review-g187514-d87654321-Reviews-La_Taberna_del_Capitan-Madrid.html',
  'https://www.thefork.es/restaurante/la-taberna-del-capitan-r789012',
  'https://glovoapp.com/es/es/madrid/taberna-capitan-mad/',
  'https://www.ubereats.com/es/store/taberna-capitan/xyz789abc012',
  'https://www.just-eat.es/restaurants-taberna-capitan-madrid',
  'https://deliveroo.es/menu/madrid/centro/taberna-capitan',
  '{
    "opentable": "https://www.opentable.es/r/taberna-capitan-madrid",
    "bookatable": "https://www.bookatable.es/taberna-capitan-madrid"
  }',
  '{
    "carta_digital": "https://www.tabernaelcapitan.com/carta",
    "pdf_menu": "https://www.tabernaelcapitan.com/menu-mariscos.pdf",
    "wine_list": "https://www.tabernaelcapitan.com/carta-vinos.pdf"
  }',
  23, 8, 15
),
(
  'Pizzería Bella Napoli', 'pizzeria-bella-napoli',
  'Auténtica pizzería italiana con horno de leña. Masas artesanales y ingredientes importados directamente desde Italia.',
  '€€', 4.4, 512,
  'Gran Vía 28, Madrid', 'https://www.bellanapoli.es',
  '+34915559876', 'ciao@bellanapoli.es',
  40.4200, -3.7038, 3, true, true,
  '{
    "facebook": "https://www.facebook.com/bellanapolimadrid",
    "instagram": "https://www.instagram.com/bella_napoli_madrid",
    "twitter": "https://www.twitter.com/bellanapoli_mad",
    "youtube": "https://www.youtube.com/c/BellaNapoliMadrid"
  }',
  '{
    "facebook": "@bellanapolimadrid",
    "instagram": "@bella_napoli_madrid",
    "twitter": "@bellanapoli_mad",
    "youtube": "@BellaNapoliMadrid"
  }',
  'https://www.tripadvisor.es/Restaurant_Review-g187514-d11223344-Reviews-Pizzeria_Bella_Napoli-Madrid.html',
  'https://www.thefork.es/restaurante/pizzeria-bella-napoli-r345678',
  'https://glovoapp.com/es/es/madrid/bella-napoli-pizzeria/',
  'https://www.ubereats.com/es/store/bella-napoli/def456ghi789',
  'https://www.just-eat.es/restaurants-bella-napoli-madrid',
  'https://deliveroo.es/menu/madrid/centro/bella-napoli',
  '{
    "opentable": "https://www.opentable.es/r/bella-napoli-madrid",
    "resy": "https://resy.com/cities/mad/bella-napoli"
  }',
  '{
    "carta_digital": "https://www.bellanapoli.es/menu-digital",
    "pdf_menu": "https://www.bellanapoli.es/carta-pizzas.pdf",
    "allergens_info": "https://www.bellanapoli.es/informacion-alergenos"
  }',
  41, 12, 28
),
(
  'Sushi Zen', 'sushi-zen',
  'Experiencia gastronómica japonesa única. Sushi fresco preparado por chefs japoneses con técnicas tradicionales.',
  '€€€', 4.7, 298,
  'Calle Serrano 89, Madrid', 'https://www.sushizen.es',
  '+34915552468', 'konnichiwa@sushizen.es',
  40.4240, -3.6890, 3, true, true,
  '{
    "facebook": "https://www.facebook.com/sushizenmadrid",
    "instagram": "https://www.instagram.com/sushi_zen_madrid",
    "twitter": "https://www.twitter.com/sushizen_mad",
    "tiktok": "https://www.tiktok.com/@sushizenmadrid"
  }',
  '{
    "facebook": "@sushizenmadrid",
    "instagram": "@sushi_zen_madrid",
    "twitter": "@sushizen_mad",
    "tiktok": "@sushizenmadrid"
  }',
  'https://www.tripadvisor.es/Restaurant_Review-g187514-d55667788-Reviews-Sushi_Zen-Madrid.html',
  'https://www.thefork.es/restaurante/sushi-zen-r567890',
  'https://glovoapp.com/es/es/madrid/sushi-zen-madrid/',
  'https://www.ubereats.com/es/store/sushi-zen/ghi789jkl012',
  'https://www.just-eat.es/restaurants-sushi-zen-madrid',
  'https://deliveroo.es/menu/madrid/salamanca/sushi-zen',
  '{
    "opentable": "https://www.opentable.es/r/sushi-zen-madrid",
    "resy": "https://resy.com/cities/mad/sushi-zen",
    "bookatable": "https://www.bookatable.es/sushi-zen-madrid"
  }',
  '{
    "carta_digital": "https://www.sushizen.es/menu-interactivo",
    "pdf_menu": "https://www.sushizen.es/carta-sushi.pdf",
    "omakase_menu": "https://www.sushizen.es/menu-omakase.pdf"
  }',
  67, 18, 45
);

-- Insertar tipos de cocina si no existen
INSERT INTO cuisine_types (name, slug, icon_emoji) VALUES 
('Española', 'espanola', '🇪🇸'),
('Italiana', 'italiana', '🇮🇹'),
('Japonesa', 'japonesa', '🇯🇵'),
('Mariscos', 'mariscos', '🦐')
ON CONFLICT (slug) DO NOTHING;

-- Insertar tipos de establecimiento si no existen
INSERT INTO establishment_types (name, slug) VALUES 
('Restaurante', 'restaurante'),
('Taberna', 'taberna'),
('Pizzería', 'pizzeria')
ON CONFLICT (slug) DO NOTHING;

-- Relacionar restaurantes con tipos de cocina
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_type_id) VALUES
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM cuisine_types WHERE slug = 'espanola')),
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM cuisine_types WHERE slug = 'mariscos')),
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM cuisine_types WHERE slug = 'italiana')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM cuisine_types WHERE slug = 'japonesa'))
ON CONFLICT DO NOTHING;

-- Insertar servicios adicionales
INSERT INTO services (name, slug, icon) VALUES 
('Reservas online', 'reservas-online', 'calendar'),
('Carta digital QR', 'carta-digital-qr', 'qr-code'),
('Menú sin gluten', 'menu-sin-gluten', 'wheat-off'),
('Menú vegano', 'menu-vegano', 'leaf'),
('Vinos premium', 'vinos-premium', 'wine'),
('Música en vivo', 'musica-en-vivo', 'music'),
('Eventos privados', 'eventos-privados', 'users')
ON CONFLICT (slug) DO NOTHING;

-- Relacionar restaurantes con servicios
INSERT INTO restaurant_services (restaurant_id, service_id) VALUES
-- Bar Manolo
((SELECT id FROM restaurants WHERE slug = 'bar-manolo'), (SELECT id FROM services WHERE slug = 'terraza-exterior')),
((SELECT id FROM restaurants WHERE slug = 'bar-manolo'), (SELECT id FROM services WHERE slug = 'wifi-gratis')),
((SELECT id FROM restaurants WHERE slug = 'bar-manolo'), (SELECT id FROM services WHERE slug = 'pago-con-tarjeta')),
((SELECT id FROM restaurants WHERE slug = 'bar-manolo'), (SELECT id FROM services WHERE slug = 'pet-friendly')),
((SELECT id FROM restaurants WHERE slug = 'bar-manolo'), (SELECT id FROM services WHERE slug = 'carta-digital-qr')),

-- Taberna del Capitán
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM services WHERE slug = 'wifi-gratis')),
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM services WHERE slug = 'pago-con-tarjeta')),
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM services WHERE slug = 'reservas-online')),
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM services WHERE slug = 'vinos-premium')),
((SELECT id FROM restaurants WHERE slug = 'la-taberna-del-capitan'), (SELECT id FROM services WHERE slug = 'eventos-privados')),

-- Pizzería Bella Napoli
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM services WHERE slug = 'delivery')),
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM services WHERE slug = 'wifi-gratis')),
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM services WHERE slug = 'pago-con-tarjeta')),
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM services WHERE slug = 'menu-sin-gluten')),
((SELECT id FROM restaurants WHERE slug = 'pizzeria-bella-napoli'), (SELECT id FROM services WHERE slug = 'menu-vegano')),

-- Sushi Zen
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'wifi-gratis')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'pago-con-tarjeta')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'reservas-online')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'vinos-premium')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'eventos-privados')),
((SELECT id FROM restaurants WHERE slug = 'sushi-zen'), (SELECT id FROM services WHERE slug = 'menu-sin-gluten'))
ON CONFLICT DO NOTHING;
