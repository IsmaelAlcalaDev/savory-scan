-- =============================================
-- ANALYTICS SYSTEM MIGRATION
-- =============================================

-- 1. DROP OLD METRICS TABLES
DROP TABLE IF EXISTS competitor_metrics CASCADE;
DROP TABLE IF EXISTS dish_metrics CASCADE;
DROP TABLE IF EXISTS engagement_metrics CASCADE;
DROP TABLE IF EXISTS location_metrics CASCADE;
DROP TABLE IF EXISTS peak_hours_metrics CASCADE;
DROP TABLE IF EXISTS restaurant_metrics CASCADE;
DROP TABLE IF EXISTS search_metrics CASCADE;
DROP TABLE IF EXISTS user_metrics CASCADE;

-- 2. CREATE ENUM TYPES
CREATE TYPE restaurant_role AS ENUM ('owner', 'manager', 'staff', 'viewer');

CREATE TYPE page_type_enum AS ENUM (
    'restaurant_card', 'restaurant_profile', 'dish_card', 'event_card',
    'menu_view', 'homepage', 'directory', 'search_results'
);

CREATE TYPE interaction_type_enum AS ENUM (
    'call_click', 'website_click', 'reservation_click', 'directions_click',
    'menu_view_click', 'dish_detail_click', 'add_to_cart', 'favorite_toggle'
);

CREATE TYPE target_type_enum AS ENUM ('restaurant', 'dish', 'event');

CREATE TYPE favorite_action_enum AS ENUM ('add', 'remove');

CREATE TYPE cart_action_enum AS ENUM ('add', 'remove', 'update_quantity', 'clear', 'view');

CREATE TYPE auth_provider AS ENUM ('email', 'google', 'facebook', 'apple');

CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');

CREATE TYPE log_type_enum AS ENUM (
    'user_auth', 'user_activity', 'restaurant_management',
    'security', 'error', 'admin_action'
);

-- 3. CREATE TABLES

-- Sistema de Roles Restaurante
CREATE TABLE restaurant_users (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
    role restaurant_role NOT NULL,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, restaurant_id)
);

-- Clicks y Navegación
CREATE TABLE page_visits (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    page_type page_type_enum NOT NULL,
    target_id BIGINT,
    source_page VARCHAR(100),
    position INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interacciones Específicas
CREATE TABLE user_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    interaction_type interaction_type_enum NOT NULL,
    target_id BIGINT NOT NULL,
    target_type target_type_enum NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Búsquedas y Filtros
CREATE TABLE search_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    search_query TEXT,
    location_query TEXT,
    cuisine_types INTEGER[],
    price_ranges TEXT[],
    filters_applied JSONB DEFAULT '{}',
    results_count INTEGER,
    clicked_result_id BIGINT,
    clicked_position INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoritos y Engagement
CREATE TABLE favorites_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    target_id BIGINT NOT NULL,
    target_type target_type_enum NOT NULL,
    action favorite_action_enum NOT NULL,
    source_page VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulador de Ticket/Carrito
CREATE TABLE cart_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id UUID NOT NULL,
    dish_id BIGINT REFERENCES dishes(id),
    restaurant_id BIGINT REFERENCES restaurants(id),
    action cart_action_enum NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    total_cart_value DECIMAL(10,2),
    total_items INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro y Autenticación
CREATE TABLE user_registration_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    registration_method auth_provider,
    registration_source VARCHAR(100),
    device_type device_type,
    location_data JSONB,
    referrer_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sesiones y Tiempo en Sitio
CREATE TABLE session_analytics (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    device_type device_type,
    user_agent TEXT,
    ip_address INET,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    pages_visited INTEGER DEFAULT 0,
    actions_taken INTEGER DEFAULT 0,
    bounced BOOLEAN DEFAULT FALSE
);

-- Logs de Usuarios y Restaurantes
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    restaurant_id BIGINT REFERENCES restaurants(id),
    log_type log_type_enum NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE INDEXES
CREATE INDEX idx_visits_type_target ON page_visits(page_type, target_id);
CREATE INDEX idx_visits_session ON page_visits(session_id);
CREATE INDEX idx_visits_created_at ON page_visits(created_at);

CREATE INDEX idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_interactions_target ON user_interactions(target_type, target_id);
CREATE INDEX idx_interactions_session ON user_interactions(session_id);
CREATE INDEX idx_interactions_created_at ON user_interactions(created_at);

CREATE INDEX idx_search_query ON search_analytics(search_query);
CREATE INDEX idx_search_location ON search_analytics(location_query);
CREATE INDEX idx_search_cuisines ON search_analytics USING GIN(cuisine_types);
CREATE INDEX idx_search_created_at ON search_analytics(created_at);

CREATE INDEX idx_favorites_target ON favorites_analytics(target_type, target_id);
CREATE INDEX idx_favorites_user ON favorites_analytics(user_id);
CREATE INDEX idx_favorites_created_at ON favorites_analytics(created_at);

CREATE INDEX idx_cart_dish ON cart_analytics(dish_id);
CREATE INDEX idx_cart_restaurant ON cart_analytics(restaurant_id);
CREATE INDEX idx_cart_session ON cart_analytics(session_id);
CREATE INDEX idx_cart_created_at ON cart_analytics(created_at);

CREATE INDEX idx_registration_method ON user_registration_analytics(registration_method);
CREATE INDEX idx_registration_source ON user_registration_analytics(registration_source);
CREATE INDEX idx_registration_created_at ON user_registration_analytics(created_at);

CREATE INDEX idx_session_user ON session_analytics(user_id);
CREATE INDEX idx_session_duration ON session_analytics(duration_seconds);
CREATE INDEX idx_session_start_time ON session_analytics(start_time);

CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_restaurant ON activity_logs(restaurant_id);
CREATE INDEX idx_logs_type ON activity_logs(log_type);
CREATE INDEX idx_logs_created_at ON activity_logs(created_at);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_registration_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- Restaurant Users: Solo los usuarios relacionados pueden ver/editar
CREATE POLICY "Users can view restaurant_users they are related to" 
ON restaurant_users FOR SELECT 
USING (user_id = auth.uid() OR restaurant_id IN (
    SELECT restaurant_id FROM restaurant_users WHERE user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can manage users" 
ON restaurant_users FOR ALL 
USING (restaurant_id IN (
    SELECT restaurant_id FROM restaurant_users 
    WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
));

-- Analytics tables: Solo admins y sistema pueden insertar
CREATE POLICY "System can insert page visits" 
ON page_visits FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own page visits" 
ON page_visits FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert user interactions" 
ON user_interactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own interactions" 
ON user_interactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert search analytics" 
ON search_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own search analytics" 
ON search_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert favorites analytics" 
ON favorites_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own favorites analytics" 
ON favorites_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert cart analytics" 
ON cart_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own cart analytics" 
ON cart_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert registration analytics" 
ON user_registration_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own registration analytics" 
ON user_registration_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert session analytics" 
ON session_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update session analytics" 
ON session_analytics FOR UPDATE 
USING (true);

CREATE POLICY "Users can view own session analytics" 
ON session_analytics FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" 
ON activity_logs FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view own activity logs" 
ON activity_logs FOR SELECT 
USING (user_id = auth.uid());