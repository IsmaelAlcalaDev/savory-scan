-- =============================================
-- ANALYTICS SYSTEM MIGRATION (Fixed)
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

-- 2. CREATE ENUM TYPES (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'restaurant_role') THEN
        CREATE TYPE restaurant_role AS ENUM ('owner', 'manager', 'staff', 'viewer');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'page_type_enum') THEN
        CREATE TYPE page_type_enum AS ENUM (
            'restaurant_card', 'restaurant_profile', 'dish_card', 'event_card',
            'menu_view', 'homepage', 'directory', 'search_results'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type_enum') THEN
        CREATE TYPE interaction_type_enum AS ENUM (
            'call_click', 'website_click', 'reservation_click', 'directions_click',
            'menu_view_click', 'dish_detail_click', 'add_to_cart', 'favorite_toggle'
        );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'target_type_enum') THEN
        CREATE TYPE target_type_enum AS ENUM ('restaurant', 'dish', 'event');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'favorite_action_enum') THEN
        CREATE TYPE favorite_action_enum AS ENUM ('add', 'remove');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_action_enum') THEN
        CREATE TYPE cart_action_enum AS ENUM ('add', 'remove', 'update_quantity', 'clear', 'view');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
        CREATE TYPE auth_provider AS ENUM ('email', 'google', 'facebook', 'apple');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type') THEN
        CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_type_enum') THEN
        CREATE TYPE log_type_enum AS ENUM (
            'user_auth', 'user_activity', 'restaurant_management',
            'security', 'error', 'admin_action'
        );
    END IF;
END $$;

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