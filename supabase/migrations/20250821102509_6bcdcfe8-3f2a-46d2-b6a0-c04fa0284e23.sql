-- Check current trigger function and update it to use item_id instead of restaurant_id
CREATE OR REPLACE FUNCTION public.update_favorites_count()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    IF TG_OP = 'INSERT' THEN
      IF NEW.item_type = 'restaurant' THEN
        UPDATE restaurants SET
          favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.item_id;
      ELSIF NEW.item_type = 'dish' THEN
        UPDATE dishes SET
          favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.item_id;
      ELSIF NEW.item_type = 'event' THEN
        UPDATE events SET
          favorites_count = COALESCE(favorites_count, 0) + 1
        WHERE id = NEW.item_id;
      END IF;
      RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
      IF OLD.item_type = 'restaurant' THEN
        UPDATE restaurants SET
          favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = OLD.item_id;
      ELSIF OLD.item_type = 'dish' THEN
        UPDATE dishes SET
          favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = OLD.item_id;
      ELSIF OLD.item_type = 'event' THEN
        UPDATE events SET
          favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
        WHERE id = OLD.item_id;
      END IF;
      RETURN OLD;
    END IF;

    RETURN NULL;
  END;
$$;