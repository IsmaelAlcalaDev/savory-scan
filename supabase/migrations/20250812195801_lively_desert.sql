/*
  # Fix Favorites Counter - Remove Double Triggers

  This migration fixes the double increment issue in favorites counting by:
  1. Removing duplicate triggers on user_saved_restaurants
  2. Creating a single, clean trigger for favorites counting
  3. Recalculating all favorites counters to fix any inconsistencies

  ## Changes
  1. Remove all existing triggers that update favorites_count
  2. Create one unified trigger function
  3. Recalculate counters to ensure consistency
*/

-- 1. Drop all existing triggers that might be causing duplicates
DROP TRIGGER IF EXISTS tr_favcount_user_saved_restaurants ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS tg_favcount_user_saved_restaurants_trigger ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_user_saved_restaurants_fav_counters ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS update_restaurant_favorites_counter ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS update_save_counters_restaurants ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trigger_update_save_counters ON public.user_saved_restaurants;

-- 2. Create a single, clean function to update favorites count
CREATE OR REPLACE FUNCTION public.update_restaurant_favorites_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT operations
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_active = true THEN
      UPDATE public.restaurants 
      SET favorites_count = COALESCE(favorites_count, 0) + 1
      WHERE id = NEW.restaurant_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Only update if is_active status changed
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
      IF NEW.is_active = true AND OLD.is_active = false THEN
        -- Activated: increment count
        UPDATE public.restaurants 
        SET favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.restaurant_id;
      ELSIF NEW.is_active = false AND OLD.is_active = true THEN
        -- Deactivated: decrement count
        UPDATE public.restaurants 
        SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = NEW.restaurant_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE operations
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_active = true THEN
      UPDATE public.restaurants 
      SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
      WHERE id = OLD.restaurant_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 3. Create a single trigger that handles all operations
CREATE TRIGGER trg_update_favorites_count
    AFTER INSERT OR UPDATE OR DELETE ON public.user_saved_restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_restaurant_favorites_count();

-- 4. Recalculate all favorites counters to fix any inconsistencies
UPDATE public.restaurants 
SET favorites_count = (
  SELECT COUNT(*)
  FROM public.user_saved_restaurants usr
  WHERE usr.restaurant_id = restaurants.id
    AND usr.is_active = true
);

-- 5. Log the fix completion
INSERT INTO public.analytics_events (
  event_type,
  entity_type,
  properties
) VALUES (
  'system_favorites_counter_fix',
  'system',
  jsonb_build_object(
    'action', 'fixed_double_increment',
    'timestamp', now(),
    'description', 'Removed duplicate triggers and recalculated favorites counters'
  )
);