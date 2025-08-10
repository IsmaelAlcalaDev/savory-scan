
-- Phase 1: Critical Security Fixes - RLS Policies and User Roles System

-- First, create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'moderator' THEN 2 
    WHEN 'user' THEN 3 
  END 
  LIMIT 1;
$$;

-- Create profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on critical tables that were missing it
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_saved_restaurants
CREATE POLICY "Users can manage own saved restaurants" ON public.user_saved_restaurants
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_saved_dishes
CREATE POLICY "Users can manage own saved dishes" ON public.user_saved_dishes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_saved_events
CREATE POLICY "Users can manage own saved events" ON public.user_saved_events
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can create own analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.analytics_events
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

-- Secure the restaurants table further
CREATE POLICY "Public can view published restaurants" ON public.restaurants
    FOR SELECT USING (is_published = true AND is_active = true AND deleted_at IS NULL);

-- Remove SECURITY DEFINER from search functions where not needed
CREATE OR REPLACE FUNCTION public.search_restaurants(
    search_query text DEFAULT ''::text, 
    user_lat numeric DEFAULT NULL::numeric, 
    user_lng numeric DEFAULT NULL::numeric, 
    max_distance_km numeric DEFAULT 10, 
    cuisine_type_ids integer[] DEFAULT NULL::integer[], 
    price_ranges price_range[] DEFAULT NULL::price_range[], 
    min_rating numeric DEFAULT 0, 
    has_services integer[] DEFAULT NULL::integer[], 
    limit_count integer DEFAULT 20, 
    offset_count integer DEFAULT 0
)
RETURNS TABLE(
    restaurant_id integer, 
    name character varying, 
    slug character varying, 
    description text, 
    price_range price_range, 
    google_rating numeric, 
    distance_km numeric, 
    cuisine_types text[], 
    establishment_type character varying
)
LANGUAGE plpgsql
STABLE -- Removed SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.slug,
        r.description,
        r.price_range,
        r.google_rating,
        CASE 
            WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
                haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
            ELSE NULL
        END as distance,
        COALESCE(array_agg(DISTINCT ct.name) FILTER (WHERE ct.id IS NOT NULL), '{}') as cuisines,
        et.name as establishment
    FROM restaurants r
    LEFT JOIN establishment_types et ON r.establishment_type_id = et.id
    LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
    LEFT JOIN cuisine_types ct ON rc.cuisine_type_id = ct.id
    LEFT JOIN restaurant_services rs ON r.id = rs.restaurant_id
    WHERE r.is_active = true 
      AND r.is_published = true 
      AND r.deleted_at IS NULL
      AND (search_query = '' OR 
           r.name ILIKE '%' || search_query || '%' OR
           r.description ILIKE '%' || search_query || '%' OR
           ct.name ILIKE '%' || search_query || '%')
      AND (user_lat IS NULL OR user_lng IS NULL OR 
           haversine_distance(user_lat, user_lng, r.latitude, r.longitude) <= max_distance_km)
      AND (cuisine_type_ids IS NULL OR 
           rc.cuisine_type_id = ANY(cuisine_type_ids))
      AND (price_ranges IS NULL OR 
           r.price_range = ANY(price_ranges))
      AND r.google_rating >= min_rating
      AND (has_services IS NULL OR 
           rs.service_id = ANY(has_services))
    GROUP BY r.id, r.name, r.slug, r.description, r.price_range, r.google_rating, 
             r.latitude, r.longitude, et.name
    ORDER BY 
        CASE WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
            haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
        ELSE 0 END ASC,
        r.google_rating DESC
    LIMIT limit_count OFFSET offset_count;
END;
$function$;

-- Create trigger to automatically assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    -- Assign default user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
