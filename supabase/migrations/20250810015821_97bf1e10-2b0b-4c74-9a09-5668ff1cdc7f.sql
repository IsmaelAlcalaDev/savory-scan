
-- PHASE 1: EMERGENCY RLS IMPLEMENTATION
-- Enable RLS on all critical tables that are currently exposed

-- User-related tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_events ENABLE ROW LEVEL SECURITY;

-- Security-related tables
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_patterns ENABLE ROW LEVEL SECURITY;

-- Business data tables
ALTER TABLE public.restaurant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peak_hours_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;

-- Restaurant owner tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- User saved restaurants policies
CREATE POLICY "Users can view their own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved restaurants" 
  ON public.user_saved_restaurants 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User saved dishes policies
CREATE POLICY "Users can view their own saved dishes" 
  ON public.user_saved_dishes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved dishes" 
  ON public.user_saved_dishes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved dishes" 
  ON public.user_saved_dishes 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved dishes" 
  ON public.user_saved_dishes 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved dishes" 
  ON public.user_saved_dishes 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- User saved events policies
CREATE POLICY "Users can view their own saved events" 
  ON public.user_saved_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved events" 
  ON public.user_saved_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved events" 
  ON public.user_saved_events 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved events" 
  ON public.user_saved_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved events" 
  ON public.user_saved_events 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fraud alerts policies (Admin only)
CREATE POLICY "Only admins can view fraud alerts" 
  ON public.fraud_alerts 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can create fraud alerts" 
  ON public.fraud_alerts 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update fraud alerts" 
  ON public.fraud_alerts 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Reports policies
CREATE POLICY "Users can view their own reports" 
  ON public.reports 
  FOR SELECT 
  USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create reports" 
  ON public.reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Only admins can update reports" 
  ON public.reports 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restaurant metrics policies (Restaurant owners + admins)
CREATE POLICY "Restaurant owners can view their metrics" 
  ON public.restaurant_metrics 
  FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Invoices policies (Restaurant owners + admins)
CREATE POLICY "Restaurant owners can view their invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Ticket simulations policies (Users can only see their own)
CREATE POLICY "Users can view their own tickets" 
  ON public.ticket_simulations 
  FOR SELECT 
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own tickets" 
  ON public.ticket_simulations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
  ON public.ticket_simulations 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ticket items policies
CREATE POLICY "Users can view their own ticket items" 
  ON public.ticket_items 
  FOR SELECT 
  USING (
    ticket_id IN (
      SELECT id FROM ticket_simulations WHERE user_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users can create items for their own tickets" 
  ON public.ticket_items 
  FOR INSERT 
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM ticket_simulations WHERE user_id = auth.uid()
    )
  );

-- Restaurant policies (Owner-based access)
CREATE POLICY "Restaurant owners can manage their restaurants" 
  ON public.restaurants 
  FOR ALL 
  USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Public read access for active restaurants
CREATE POLICY "Public can view active published restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (is_active = true AND is_published = true AND deleted_at IS NULL);

-- Metrics tables - Admin only
CREATE POLICY "Only admins can access engagement metrics" 
  ON public.engagement_metrics 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can access peak hours metrics" 
  ON public.peak_hours_metrics 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can access location metrics" 
  ON public.location_metrics 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can access dish metrics" 
  ON public.dish_metrics 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can access competitor metrics" 
  ON public.competitor_metrics 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Suspicious patterns - Admin only
CREATE POLICY "Only admins can access suspicious patterns" 
  ON public.suspicious_patterns 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Role security hardening: Prevent users from updating their own roles
CREATE POLICY "Prevent users from updating their own roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (false);

CREATE POLICY "Only admins can assign roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can modify roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create audit log table for security events
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action_type,
    entity_type,
    entity_id,
    details
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
