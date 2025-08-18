-- Fix Security Definer View vulnerabilities
-- Change ownership of all views from postgres to authenticator to ensure proper RLS enforcement

-- Change view ownership to authenticator (less privileged role)
ALTER VIEW public.active_fraud_alerts OWNER TO authenticator;
ALTER VIEW public.diet_summary OWNER TO authenticator;
ALTER VIEW public.dishes_full OWNER TO authenticator;
ALTER VIEW public.famous_areas_summary OWNER TO authenticator;
ALTER VIEW public.most_favorited_items OWNER TO authenticator;
ALTER VIEW public.restaurant_stats OWNER TO authenticator;
ALTER VIEW public.restaurants_full OWNER TO authenticator;
ALTER VIEW public.restaurants_with_counters OWNER TO authenticator;
ALTER VIEW public.services_by_category OWNER TO authenticator;
ALTER VIEW public.tickets_summary OWNER TO authenticator;
ALTER VIEW public.v_dishes_with_images OWNER TO authenticator;
ALTER VIEW public.v_restaurant_galleries OWNER TO authenticator;
ALTER VIEW public.v_restaurants_with_images OWNER TO authenticator;

-- Revoke excessive permissions and grant only necessary ones
-- Remove all existing permissions first
REVOKE ALL ON public.active_fraud_alerts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.diet_summary FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.dishes_full FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.famous_areas_summary FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.most_favorited_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.restaurant_stats FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.restaurants_full FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.restaurants_with_counters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.services_by_category FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.tickets_summary FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.v_dishes_with_images FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.v_restaurant_galleries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.v_restaurants_with_images FROM PUBLIC, anon, authenticated;

-- Grant appropriate SELECT permissions for public views that should be accessible
GRANT SELECT ON public.diet_summary TO anon, authenticated;
GRANT SELECT ON public.dishes_full TO anon, authenticated;
GRANT SELECT ON public.famous_areas_summary TO anon, authenticated;
GRANT SELECT ON public.most_favorited_items TO anon, authenticated;
GRANT SELECT ON public.restaurants_full TO anon, authenticated;
GRANT SELECT ON public.restaurants_with_counters TO anon, authenticated;
GRANT SELECT ON public.services_by_category TO anon, authenticated;
GRANT SELECT ON public.v_dishes_with_images TO anon, authenticated;
GRANT SELECT ON public.v_restaurant_galleries TO anon, authenticated;
GRANT SELECT ON public.v_restaurants_with_images TO anon, authenticated;

-- Sensitive views should only be accessible to authenticated users or specific roles
-- active_fraud_alerts - admin only (will rely on RLS policies)
-- restaurant_stats - business owners and admins
-- tickets_summary - authenticated users only

-- Enable RLS on views that don't have it to ensure proper access control
ALTER VIEW public.active_fraud_alerts SET (security_barrier = true);
ALTER VIEW public.restaurant_stats SET (security_barrier = true);
ALTER VIEW public.tickets_summary SET (security_barrier = true);

-- Create RLS policies for sensitive views
CREATE POLICY "Admins can view fraud alerts" ON public.active_fraud_alerts
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Restaurant owners can view their stats" ON public.restaurant_stats
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = restaurant_stats.id 
    AND r.owner_id = auth.uid()
  ) 
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can view their tickets" ON public.tickets_summary
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR public.is_admin(auth.uid())
  )
);