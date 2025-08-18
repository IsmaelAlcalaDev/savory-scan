
-- Crear tabla de configuración de plataformas
CREATE TABLE platform_configs (
  id SERIAL PRIMARY KEY,
  platform_key VARCHAR(50) UNIQUE NOT NULL,
  platform_name VARCHAR(100) NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  icon_color VARCHAR(20),
  base_url VARCHAR(255),
  url_pattern VARCHAR(255),
  category VARCHAR(50) NOT NULL, -- 'social', 'delivery', 'booking', 'review'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuraciones de plataformas
INSERT INTO platform_configs (platform_key, platform_name, icon_name, icon_color, base_url, url_pattern, category, display_order) VALUES
-- Redes sociales
('facebook', 'Facebook', 'Facebook', '#1877F2', 'https://facebook.com', null, 'social', 1),
('instagram', 'Instagram', 'Instagram', '#E4405F', 'https://instagram.com', null, 'social', 2),
('twitter', 'Twitter', 'Twitter', '#1DA1F2', 'https://twitter.com', null, 'social', 3),
('tiktok', 'TikTok', 'Music', '#000000', 'https://tiktok.com', null, 'social', 4),
('youtube', 'YouTube', 'Youtube', '#FF0000', 'https://youtube.com', null, 'social', 5),

-- Plataformas de delivery
('glovo', 'Glovo', 'Truck', '#FFC244', 'https://glovoapp.com', null, 'delivery', 1),
('ubereats', 'Uber Eats', 'Utensils', '#000000', 'https://ubereats.com', null, 'delivery', 2),
('justeat', 'Just Eat', 'ChefHat', '#FF8000', 'https://just-eat.es', null, 'delivery', 3),
('deliveroo', 'Deliveroo', 'Bike', '#00CCBC', 'https://deliveroo.es', null, 'delivery', 4),

-- Plataformas de reservas
('thefork', 'TheFork', 'Calendar', '#2DD4BF', 'https://thefork.es', null, 'booking', 1),
('opentable', 'OpenTable', 'CalendarCheck', '#DA3743', 'https://opentable.es', null, 'booking', 2),
('resy', 'Resy', 'Clock', '#D97706', 'https://resy.com', null, 'booking', 3),

-- Plataformas de reseñas
('tripadvisor', 'TripAdvisor', 'Star', '#00AA6C', 'https://tripadvisor.es', null, 'review', 1),
('google', 'Google Maps', 'MapPin', '#4285F4', 'https://maps.google.com', null, 'review', 2);

-- Crear tabla de configuración de aplicación
CREATE TABLE app_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración básica
INSERT INTO app_config (config_key, config_value, description, category, is_public) VALUES
('contact_info', '{"phone": "+34 900 123 456", "email": "info@savorysearch.com", "address": "Madrid, España"}', 'Información de contacto principal', 'contact', true),
('social_links', '{"facebook": "https://facebook.com/savorysearch", "instagram": "https://instagram.com/savorysearch", "twitter": "https://twitter.com/savorysearch"}', 'Enlaces de redes sociales principales', 'social', true),
('platform_colors', '{"primary": "#FF6B35", "secondary": "#2DD4BF", "accent": "#8B5CF6"}', 'Colores de la plataforma', 'branding', true);
