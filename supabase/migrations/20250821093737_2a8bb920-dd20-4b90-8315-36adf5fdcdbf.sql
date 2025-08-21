-- Replace the current trigger function to only handle restaurants
CREATE OR REPLACE FUNCTION public.update_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Solo para restaurantes (tabla actual)
    UPDATE restaurants SET
      favorites_count = COALESCE(favorites_count, 0) + 1,
      favorites_count_week = COALESCE(favorites_count_week, 0) + 1
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Solo para restaurantes (tabla actual)
    UPDATE restaurants SET
      favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0),
      favorites_count_week = GREATEST(COALESCE(favorites_count_week, 0) - 1, 0)
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;