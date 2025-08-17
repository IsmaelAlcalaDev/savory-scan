
-- Create analytics_sessions table for session tracking without PII
CREATE TABLE public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT,
  geo_city TEXT, -- City-level geographic data only (no precise location)
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing analytics_events table structure
ALTER TABLE public.analytics_events 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.analytics_sessions(id),
ADD COLUMN IF NOT EXISTS restaurant_id BIGINT,
ADD COLUMN IF NOT EXISTS dish_id BIGINT,
ADD COLUMN IF NOT EXISTS event_name TEXT,
ADD COLUMN IF NOT EXISTS event_value JSONB DEFAULT '{}';

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created 
ON public.analytics_events USING btree(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_restaurant 
ON public.analytics_events USING btree(restaurant_id) 
WHERE restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_dish 
ON public.analytics_events USING btree(dish_id) 
WHERE dish_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
ON public.analytics_events USING btree(session_id);

-- BRIN index for time-series data (created_at)
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_brin 
ON public.analytics_events USING brin(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_brin 
ON public.analytics_sessions USING brin(started_at);

-- Enable RLS on analytics_sessions
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for analytics_sessions - allow public insert for anonymous tracking
CREATE POLICY "Allow anonymous session creation" 
ON public.analytics_sessions 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Policy for analytics_sessions - no select for privacy
CREATE POLICY "No direct session access" 
ON public.analytics_sessions 
FOR SELECT 
TO public 
USING (false);

-- Update RLS policies for analytics_events to allow anonymous tracking
DROP POLICY IF EXISTS "Users can create own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;

CREATE POLICY "Allow anonymous event creation" 
ON public.analytics_events 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Only allow system/admin access to read events
CREATE POLICY "System can read analytics events" 
ON public.analytics_events 
FOR SELECT 
TO service_role 
USING (true);

-- Create function for automatic data retention (90 days for events, 1 year for sessions)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete events older than 90 days
  DELETE FROM public.analytics_events 
  WHERE created_at < now() - interval '90 days';
  
  -- Delete sessions older than 1 year that have no recent events
  DELETE FROM public.analytics_sessions 
  WHERE started_at < now() - interval '1 year'
  AND id NOT IN (
    SELECT DISTINCT session_id 
    FROM public.analytics_events 
    WHERE session_id IS NOT NULL 
    AND created_at > now() - interval '90 days'
  );
END;
$$;

-- Create a trigger to automatically generate session data
CREATE OR REPLACE FUNCTION create_analytics_session(
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_geo_city TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO public.analytics_sessions (user_agent, referrer, geo_city, timezone)
  VALUES (p_user_agent, p_referrer, p_geo_city, p_timezone)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_analytics_session TO public;
GRANT EXECUTE ON FUNCTION cleanup_old_analytics_data TO service_role;
