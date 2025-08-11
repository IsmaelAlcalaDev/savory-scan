
-- Phase 1: Enable RLS and create policies for critical user data tables

-- 1. User-related tables that need RLS protection
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;

-- 2. Business data tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peak_hours_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_metrics ENABLE ROW LEVEL SECURITY;

-- 3. Security-critical tables
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_patterns ENABLE ROW LEVEL SECURITY;

-- 4. Competition/analytics tables
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data tables
-- Users can only access their own devices
CREATE POLICY "Users can view own devices" ON public.user_devices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own devices" ON public.user_devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.user_devices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.user_devices
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own search history
CREATE POLICY "Users can view own search history" ON public.user_search_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own search history" ON public.user_search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own search history" ON public.user_search_history
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own metrics
CREATE POLICY "Users can view own metrics" ON public.user_metrics
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for business data
-- Reports: Users can see their own reports, admins can see all
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Invoices: Only restaurant owners can see their invoices, admins can see all
CREATE POLICY "Restaurant owners can view own invoices" ON public.invoices
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- Restaurant metrics: Only restaurant owners and admins
CREATE POLICY "Restaurant owners can view own metrics" ON public.restaurant_metrics
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Restaurant owners can view own engagement metrics" ON public.engagement_metrics
  FOR SELECT USING (
    entity_type = 'restaurant' AND entity_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Restaurant owners can view own peak hours" ON public.peak_hours_metrics
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

-- Location metrics: Admin only
CREATE POLICY "Admins can view location metrics" ON public.location_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage location metrics" ON public.location_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Security tables: Admin only access
CREATE POLICY "Admins can view fraud alerts" ON public.fraud_alerts
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view fraud rules" ON public.fraud_detection_rules
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage fraud rules" ON public.fraud_detection_rules
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view suspicious patterns" ON public.suspicious_patterns
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage suspicious patterns" ON public.suspicious_patterns
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Competition data: Admin only
CREATE POLICY "Admins can view competitor metrics" ON public.competitor_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage competitor metrics" ON public.competitor_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create secure RPC functions for admin operations
CREATE OR REPLACE FUNCTION public.get_restaurant_stats_secure()
RETURNS TABLE(
  id integer,
  name character varying,
  google_rating numeric,
  google_rating_count integer,
  favorites_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.google_rating,
    r.google_rating_count,
    r.favorites_count
  FROM restaurants r
  WHERE r.is_active = true 
    AND r.is_published = true
  ORDER BY r.favorites_count DESC
  LIMIT 50;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_roles_secure()
RETURNS TABLE(
  id uuid,
  role app_role,
  user_email text,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    ur.id,
    ur.role,
    p.email,
    p.full_name
  FROM user_roles ur
  LEFT JOIN profiles p ON ur.user_id = p.id
  ORDER BY ur.role, p.email
  LIMIT 100;
END;
$$;

-- Create audit logging function for admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  entity_type text DEFAULT NULL,
  entity_id text DEFAULT NULL,
  details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  INSERT INTO analytics_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    properties,
    session_id
  ) VALUES (
    auth.uid(),
    'admin_' || action_type,
    entity_type,
    entity_id::integer,
    details || jsonb_build_object(
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    'admin_session_' || extract(epoch from now())::text
  );
END;
$$;
