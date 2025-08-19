
-- PHASE 1: CRITICAL SECURITY FIXES

-- 1. Enable RLS on all user-related tables that are missing it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_auth_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for users table (most critical - contains PII)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- 3. Create RLS policies for user_auth_providers
CREATE POLICY "Users can view own auth providers" ON public.user_auth_providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own auth providers" ON public.user_auth_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert auth providers" ON public.user_auth_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Create RLS policies for user_saved_restaurants
CREATE POLICY "Users can view own saved restaurants" ON public.user_saved_restaurants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved restaurants" ON public.user_saved_restaurants
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create RLS policies for user_saved_dishes
CREATE POLICY "Users can view own saved dishes" ON public.user_saved_dishes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved dishes" ON public.user_saved_dishes
  FOR ALL USING (auth.uid() = user_id);

-- 6. Create RLS policies for user_saved_events
CREATE POLICY "Users can view own saved events" ON public.user_saved_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved events" ON public.user_saved_events
  FOR ALL USING (auth.uid() = user_id);

-- 7. Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 8. Secure analytics and fraud detection tables
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access fraud alerts" ON public.fraud_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can access fraud rules" ON public.fraud_detection_rules
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can access suspicious patterns" ON public.suspicious_patterns
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- 9. Secure metrics tables that may contain sensitive data
ALTER TABLE public.restaurant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_metrics ENABLE ROW LEVEL SECURITY;

-- Restaurant owners can view their own metrics, admins can view all
CREATE POLICY "Restaurant owners can view own metrics" ON public.restaurant_metrics
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Only admins can access engagement metrics" ON public.engagement_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can access location metrics" ON public.location_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- 10. Secure remaining sensitive tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view own invoices" ON public.invoices
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 11. Add missing user_id column constraints to prevent null values in critical tables
ALTER TABLE public.users ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.user_auth_providers ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_saved_restaurants ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_saved_dishes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_saved_events ALTER COLUMN user_id SET NOT NULL;

-- 12. Create unique constraints to prevent duplicate entries
ALTER TABLE public.user_saved_restaurants 
  ADD CONSTRAINT unique_user_restaurant 
  UNIQUE (user_id, restaurant_id);

ALTER TABLE public.user_saved_dishes 
  ADD CONSTRAINT unique_user_dish 
  UNIQUE (user_id, dish_id);

ALTER TABLE public.user_saved_events 
  ADD CONSTRAINT unique_user_event 
  UNIQUE (user_id, event_id);

-- 13. Fix the users table to have proper NOT NULL constraints for required fields
ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE public.users ALTER COLUMN avatar_url SET NOT NULL;
