
-- Fix critical RLS policy issues

-- 1. Add missing RLS policies for user_saved_restaurants
CREATE POLICY "Users can view own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved restaurants" 
  ON public.user_saved_restaurants 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Add missing RLS policies for user_saved_dishes
CREATE POLICY "Users can view own saved dishes" 
  ON public.user_saved_dishes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved dishes" 
  ON public.user_saved_dishes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved dishes" 
  ON public.user_saved_dishes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved dishes" 
  ON public.user_saved_dishes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 3. Add missing RLS policies for user_saved_events
CREATE POLICY "Users can view own saved events" 
  ON public.user_saved_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved events" 
  ON public.user_saved_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved events" 
  ON public.user_saved_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved events" 
  ON public.user_saved_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Restrict restaurants table access - only allow public reads and owner updates
CREATE POLICY "Public can view active restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (is_active = true AND is_published = true);

CREATE POLICY "Owners can manage their restaurants" 
  ON public.restaurants 
  FOR ALL 
  USING (auth.uid() = owner_id);

-- 5. Add missing DELETE policy for notifications
CREATE POLICY "Users can delete own notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Restrict user_roles table access to prevent privilege escalation
CREATE POLICY "Users can view own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Harden security definer functions with proper validation
CREATE OR REPLACE FUNCTION public.toggle_restaurant_favorite(user_id_param uuid, restaurant_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
BEGIN
  -- Strict authentication check
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Validate restaurant exists and is active
  IF NOT EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id_param AND is_active = true) THEN
    RAISE EXCEPTION 'Restaurant not found or inactive';
  END IF;

  -- Rest of function logic remains the same
  SELECT is_active INTO is_currently_saved
  FROM public.user_saved_restaurants
  WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;

  IF is_currently_saved IS NULL THEN
    INSERT INTO public.user_saved_restaurants (user_id, restaurant_id, saved_from, is_active, saved_at)
    VALUES (user_id_param, restaurant_id_param, 'toggle', true, CURRENT_TIMESTAMP);
    RETURN true;
  ELSIF is_currently_saved = false THEN
    UPDATE public.user_saved_restaurants
    SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN true;
  ELSE
    UPDATE public.user_saved_restaurants
    SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param AND restaurant_id = restaurant_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- 8. Harden toggle_dish_favorite function
CREATE OR REPLACE FUNCTION public.toggle_dish_favorite(user_id_param uuid, dish_id_param integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  is_currently_saved BOOLEAN;
  restaurant_id_val INTEGER;
BEGIN
  -- Strict authentication check
  IF auth.uid() IS NULL OR auth.uid() <> user_id_param THEN
    RAISE EXCEPTION 'Unauthorized access attempt';
  END IF;

  -- Validate dish exists and get restaurant_id
  SELECT restaurant_id INTO restaurant_id_val
  FROM public.dishes
  WHERE id = dish_id_param AND is_active = true AND deleted_at IS NULL;

  IF restaurant_id_val IS NULL THEN
    RAISE EXCEPTION 'Dish not found or inactive';
  END IF;

  -- Rest of function logic remains the same
  SELECT is_active INTO is_currently_saved
  FROM public.user_saved_dishes
  WHERE user_id = user_id_param AND dish_id = dish_id_param;

  IF is_currently_saved IS NULL THEN
    INSERT INTO public.user_saved_dishes (user_id, dish_id, restaurant_id, saved_from, is_active, saved_at)
    VALUES (user_id_param, dish_id_param, restaurant_id_val, 'toggle', true, CURRENT_TIMESTAMP);
    RETURN true;
  ELSIF is_currently_saved = false THEN
    UPDATE public.user_saved_dishes
    SET is_active = true, saved_at = CURRENT_TIMESTAMP, unsaved_at = NULL
    WHERE user_id = user_id_param AND dish_id = dish_id_param;
    RETURN true;
  ELSE
    UPDATE public.user_saved_dishes
    SET is_active = false, unsaved_at = CURRENT_TIMESTAMP
    WHERE user_id = user_id_param AND dish_id = dish_id_param;
    RETURN false;
  END IF;
END;
$function$;

-- 9. Create security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  action_type TEXT,
  entity_type TEXT DEFAULT NULL,
  entity_id TEXT DEFAULT NULL,
  details JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.analytics_events (
    user_id,
    event_type,
    entity_type,
    entity_id,
    properties,
    session_id
  ) VALUES (
    auth.uid(),
    'security_' || action_type,
    entity_type,
    entity_id::INTEGER,
    details,
    'security_' || extract(epoch from now())::TEXT
  );
END;
$function$;
