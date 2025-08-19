
-- 1. Fix notifications table - remove permissive INSERT policy and add proper user-scoped policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create own notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Create missing tables that were referenced but don't exist yet
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  user_agent TEXT,
  ip_address INET,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id INTEGER,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  push_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_name TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cohort_data JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  searches_count INTEGER DEFAULT 0,
  restaurants_viewed INTEGER DEFAULT 0,
  dishes_saved INTEGER DEFAULT 0,
  tickets_created INTEGER DEFAULT 0,
  session_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.suspicious_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  occurrences INTEGER DEFAULT 1,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_resolved BOOLEAN DEFAULT false,
  UNIQUE(pattern_type, target_id)
);

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Enable RLS on all sensitive tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peak_hours_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user-owned tables
-- User preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" ON public.user_preferences
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- User sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.user_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.user_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sessions" ON public.user_sessions
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User search history
CREATE POLICY "Users can manage own search history" ON public.user_search_history
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all search history" ON public.user_search_history
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- User devices
CREATE POLICY "Users can manage own devices" ON public.user_devices
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all devices" ON public.user_devices
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- User cohorts
CREATE POLICY "Users can view own cohorts" ON public.user_cohorts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cohorts" ON public.user_cohorts
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- User metrics
CREATE POLICY "Users can view own metrics" ON public.user_metrics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user metrics" ON public.user_metrics
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 5. Admin-only tables policies
-- Reports
CREATE POLICY "Admins can manage all reports" ON public.reports
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create reports" ON public.reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
FOR SELECT USING (auth.uid() = reporter_id);

-- Fraud alerts
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Suspicious patterns
CREATE POLICY "Admins can manage suspicious patterns" ON public.suspicious_patterns
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Invoices
CREATE POLICY "Admins can manage invoices" ON public.invoices
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Security audit log
CREATE POLICY "Admins can view security audit log" ON public.security_audit_log
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create audit entries" ON public.security_audit_log
FOR INSERT WITH CHECK (true);

-- 6. Metrics tables - admin read-only
CREATE POLICY "Admins can view restaurant metrics" ON public.restaurant_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view dish metrics" ON public.dish_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view engagement metrics" ON public.engagement_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view peak hours metrics" ON public.peak_hours_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view location metrics" ON public.location_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view competitor metrics" ON public.competitor_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- 7. Harden SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.toggle_event_favorite(user_id_param uuid, event_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    is_currently_saved BOOLEAN;
    restaurant_id_val INTEGER;
BEGIN
    -- Validate authentication
    IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Get restaurant_id from event
    SELECT restaurant_id INTO restaurant_id_val FROM events WHERE id = event_id_param;
    
    -- Check current state
    SELECT is_active INTO is_currently_saved
    FROM user_saved_events 
    WHERE user_id = user_id_param AND event_id = event_id_param;
    
    IF is_currently_saved IS NULL THEN
        -- Create new favorite
        INSERT INTO user_saved_events (user_id, event_id, restaurant_id, saved_from)
        VALUES (user_id_param, event_id_param, restaurant_id_val, 'toggle');
        RETURN true;
    ELSIF is_currently_saved = false THEN
        -- Reactivate
        UPDATE user_saved_events 
        SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
        WHERE user_id = user_id_param AND event_id = event_id_param;
        RETURN true;
    ELSE
        -- Deactivate
        UPDATE user_saved_events 
        SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
        WHERE user_id = user_id_param AND event_id = event_id_param;
        RETURN false;
    END IF;
END;
$function$;

-- 8. Create secure notification creation function
CREATE OR REPLACE FUNCTION public.create_notification(
    target_user_id UUID,
    notification_title TEXT,
    notification_body TEXT,
    notification_type notification_type,
    notification_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    notification_id UUID;
BEGIN
    -- Only allow admins or system to create notifications
    IF NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized to create notifications';
    END IF;
    
    -- Validate inputs
    IF target_user_id IS NULL OR notification_title IS NULL OR notification_body IS NULL THEN
        RAISE EXCEPTION 'Missing required notification parameters';
    END IF;
    
    -- Insert notification
    INSERT INTO public.notifications (
        user_id, 
        title, 
        body, 
        type, 
        data
    ) VALUES (
        target_user_id,
        notification_title,
        notification_body,
        notification_type,
        COALESCE(notification_data, '{}')
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$function$;

-- 9. Create security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
    action_type TEXT,
    entity_type TEXT DEFAULT NULL,
    entity_id TEXT DEFAULT NULL,
    details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.security_audit_log (
        user_id,
        action_type,
        entity_type,
        entity_id,
        details,
        created_at
    ) VALUES (
        auth.uid(),
        action_type,
        entity_type,
        entity_id,
        COALESCE(details, '{}'),
        CURRENT_TIMESTAMP
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$function$;

-- 10. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON public.user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cohorts_user_id ON public.user_cohorts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON public.user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at);
