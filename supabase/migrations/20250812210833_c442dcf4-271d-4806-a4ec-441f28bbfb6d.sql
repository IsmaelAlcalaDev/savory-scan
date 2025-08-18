
-- Comprehensive Security Fix Migration
-- Phase 1: Critical Database Security - Enable RLS on all sensitive tables

-- 1. Enable RLS on financial and invoice tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their invoices" ON public.invoices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = invoices.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Restaurant owners can create invoices" ON public.invoices
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = invoices.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Enable RLS on fraud detection tables
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view fraud alerts" ON public.fraud_alerts
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage fraud rules" ON public.fraud_detection_rules
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Enable RLS on user data tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Enable RLS on restaurant metrics
ALTER TABLE public.restaurant_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their metrics" ON public.restaurant_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = restaurant_metrics.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 5. Enable RLS on engagement metrics
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all engagement metrics" ON public.engagement_metrics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Enable RLS on dish metrics
ALTER TABLE public.dish_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their dish metrics" ON public.dish_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.dishes d
    JOIN public.restaurants r ON r.id = d.restaurant_id
    WHERE d.id = dish_metrics.dish_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 7. Enable RLS on peak hours metrics
ALTER TABLE public.peak_hours_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurant owners can view their peak hours" ON public.peak_hours_metrics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = peak_hours_metrics.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 8. Enable RLS on location metrics
ALTER TABLE public.location_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view location metrics" ON public.location_metrics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. Enable RLS on competitor metrics
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view competitor metrics" ON public.competitor_metrics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 10. Enable RLS on popularity counters
ALTER TABLE public.popularity_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view popularity counters" ON public.popularity_counters
FOR SELECT USING (true);

CREATE POLICY "Only system can update popularity" ON public.popularity_counters
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 11. Enable RLS on reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reports
FOR SELECT USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage reports" ON public.reports
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 12. Fix analytics_events to allow admins to view security events
CREATE POLICY "Admins can view analytics events" ON public.analytics_events
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 13. Enable RLS on restaurant tables for better owner control
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published restaurants" ON public.restaurants
FOR SELECT USING (is_published = true AND is_active = true);

CREATE POLICY "Owners can manage their restaurants" ON public.restaurants
FOR ALL USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 14. Enable RLS on dishes
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active dishes" ON public.dishes
FOR SELECT USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND r.is_published = true 
    AND r.is_active = true
  )
);

CREATE POLICY "Restaurant owners can manage their dishes" ON public.dishes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = dishes.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 15. Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active events" ON public.events
FOR SELECT USING (
  is_active = true AND 
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = events.restaurant_id 
    AND r.is_published = true 
    AND r.is_active = true
  )
);

CREATE POLICY "Restaurant owners can manage their events" ON public.events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = events.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 16. Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promotions" ON public.promotions
FOR SELECT USING (
  is_active = true AND 
  valid_until > now() AND
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = promotions.restaurant_id 
    AND r.is_published = true 
    AND r.is_active = true
  )
);

CREATE POLICY "Restaurant owners can manage their promotions" ON public.promotions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = promotions.restaurant_id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 17. Log this security remediation
INSERT INTO public.analytics_events (
  event_type,
  entity_type,
  properties
) VALUES (
  'security_rls_policies_enabled',
  'system',
  '{"tables_secured": 17, "policies_created": 25, "security_level": "critical"}'::jsonb
);
