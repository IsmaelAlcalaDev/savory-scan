
-- Phase 1: Critical Database Security Fixes

-- 1. Add missing RLS policies for menu_sections table
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active menu sections" 
ON public.menu_sections 
FOR SELECT 
USING (is_active = true);

-- 2. Add missing RLS policies for dishes table  
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active dishes" 
ON public.dishes 
FOR SELECT 
USING (is_active = true AND deleted_at IS NULL);

-- 3. Add missing RLS policies for promotions table
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promotions" 
ON public.promotions 
FOR SELECT 
USING (is_active = true AND deleted_at IS NULL AND valid_from <= NOW() AND valid_until >= NOW());

-- 4. Add missing RLS policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active events" 
ON public.events 
FOR SELECT 
USING (is_active = true AND deleted_at IS NULL AND event_date >= CURRENT_DATE);

-- 5. Add missing RLS policies for app_settings table
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view public app settings" 
ON public.app_settings 
FOR SELECT 
USING (is_public = true);

-- 6. Fix critical user_roles privilege escalation vulnerability
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to safely check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
$$;

-- Users can view their own roles
CREATE POLICY "Users can view own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins can create new role assignments
CREATE POLICY "Admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Only admins can update role assignments
CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Only admins can delete role assignments
CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_admin(auth.uid()));

-- 7. Enhance analytics_events security
CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 8. Add admin-only policies for sensitive tables
CREATE POLICY "Admins can view all fraud alerts" 
ON public.fraud_alerts 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all reports" 
ON public.reports 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 9. Create security audit function for monitoring
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  entity_type TEXT DEFAULT NULL,
  entity_id TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.analytics_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    properties,
    created_at
  ) VALUES (
    auth.uid(),
    'security_' || event_type,
    entity_type,
    entity_id::integer,
    details || jsonb_build_object(
      'timestamp', NOW(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    NOW()
  );
END;
$$;
