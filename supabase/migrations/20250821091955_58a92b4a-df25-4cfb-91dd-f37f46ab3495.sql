-- Update the trigger function to work without is_active field
-- Since we removed is_active, now:
-- INSERT = add favorite (+1)
-- DELETE = remove favorite (-1)
-- No UPDATE needed (we don't update, we INSERT/DELETE)
CREATE OR REPLACE FUNCTION public.update_restaurant_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle INSERT (add favorite)
  IF TG_OP = 'INSERT' THEN
    UPDATE restaurants 
    SET 
      favorites_count = COALESCE(favorites_count, 0) + 1,
      favorites_count_week = COALESCE(favorites_count_week, 0) + 1
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  END IF;

  -- Handle DELETE (remove favorite)
  IF TG_OP = 'DELETE' THEN
    UPDATE restaurants 
    SET 
      favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0),
      favorites_count_week = GREATEST(COALESCE(favorites_count_week, 0) - 1, 0)
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;