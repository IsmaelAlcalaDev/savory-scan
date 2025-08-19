
-- Primero, veamos qué tablas están actualmente en la publicación realtime
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- Eliminar tablas ruidosas que no necesitamos en tiempo real
-- Tablas de métricas y analytics que no necesitan updates inmediatos
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS analytics_events;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS restaurant_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS dish_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS engagement_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS location_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS peak_hours_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS competitor_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS popularity_counters;

-- Tablas de configuración que raramente cambian
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS app_config;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS app_settings;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS platform_configs;

-- Tablas de catálogos que no cambian en tiempo real
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS cuisine_types;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS diet_types;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS food_types;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS establishment_types;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS allergens;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS price_ranges;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS rating_options;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS distance_ranges;

-- Tablas geográficas que no cambian
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS countries;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS regions;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS provinces;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS municipalities;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS cities;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS districts;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS points_of_interest;

-- Tablas de facturación y reportes
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS invoices;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS reports;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS fraud_alerts;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS fraud_detection_rules;

-- Tablas de galería y relaciones que no necesitan updates inmediatos
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS restaurant_gallery;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS restaurant_cuisines;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS menu_sections;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS dish_categories;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS dish_variants;

-- Mantener SOLO las tablas críticas para tiempo real:
-- restaurants (para updates de rating, favoritos, etc)
-- dishes (para updates de precio, disponibilidad)
-- user_saved_restaurants (para sincronizar favoritos)
-- user_saved_dishes (para sincronizar favoritos de platos)
-- events (para updates de eventos)
-- promotions (para updates de promociones)
-- notifications (para notificaciones en tiempo real)

-- Verificar qué tablas quedan en la publicación
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;
