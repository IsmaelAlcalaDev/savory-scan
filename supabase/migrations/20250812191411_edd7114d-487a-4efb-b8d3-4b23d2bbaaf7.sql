
-- Step 1: Inspect current triggers on user_saved_restaurants
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'user_saved_restaurants' 
    AND event_object_schema = 'public'
ORDER BY trigger_name;

-- Step 2: Drop all existing triggers that might be causing duplicates
DROP TRIGGER IF EXISTS update_restaurant_favorites_count_trigger ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trigger_update_save_counters ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS tg_favcount_user_saved_restaurants_trigger ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_user_saved_restaurants_fav_counters ON public.user_saved_restaurants;

-- Step 3: Create a single canonical trigger using the correct function
CREATE TRIGGER trg_user_saved_restaurants_fav_counters
    AFTER INSERT OR UPDATE OR DELETE ON public.user_saved_restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_favorites_counters();

-- Step 4: Recalculate all favorites counters to fix inflated counts
SELECT public.recalculate_favorites_counters();

-- Step 5: Verify the trigger is correctly installed
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'user_saved_restaurants' 
    AND event_object_schema = 'public'
ORDER BY trigger_name;
