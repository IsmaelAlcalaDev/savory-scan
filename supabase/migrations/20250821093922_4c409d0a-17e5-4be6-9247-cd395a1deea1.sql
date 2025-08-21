-- Add new columns to the existing user_favorites table
ALTER TABLE public.user_favorites
ADD COLUMN item_id bigint,
ADD COLUMN item_type text CHECK (item_type IN ('restaurant', 'dish', 'event')),
ADD COLUMN saved_at timestamptz DEFAULT now(),
ADD COLUMN saved_from text DEFAULT 'button';

-- Migrate existing data
UPDATE public.user_favorites
SET item_id = restaurant_id,
    item_type = 'restaurant',
    saved_at = created_at,
    saved_from = 'legacy';

-- Add unique constraint for the new structure
ALTER TABLE public.user_favorites
ADD CONSTRAINT unique_user_item_favorite
UNIQUE(user_id, item_id, item_type);

-- Update the trigger function to handle all item types
CREATE OR REPLACE FUNCTION public.update_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.item_type = 'restaurant' THEN
      UPDATE restaurants SET
        favorites_count = COALESCE(favorites_count, 0) + 1,
        favorites_count_week = COALESCE(favorites_count_week, 0) + 1
      WHERE id = NEW.item_id;
    ELSIF NEW.item_type = 'dish' THEN
      UPDATE dishes SET favorites_count = COALESCE(favorites_count, 0) + 1
      WHERE id = NEW.item_id;
    ELSIF NEW.item_type = 'event' THEN
      UPDATE events SET
        favorites_count = COALESCE(favorites_count, 0) + 1,
        favorites_count_week = COALESCE(favorites_count_week, 0) + 1
      WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF OLD.item_type = 'restaurant' THEN
      UPDATE restaurants SET
        favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0),
        favorites_count_week = GREATEST(COALESCE(favorites_count_week, 0) - 1, 0)
      WHERE id = OLD.item_id;
    ELSIF OLD.item_type = 'dish' THEN
      UPDATE dishes SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
      WHERE id = OLD.item_id;
    ELSIF OLD.item_type = 'event' THEN
      UPDATE events SET
        favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0),
        favorites_count_week = GREATEST(COALESCE(favorites_count_week, 0) - 1, 0)
      WHERE id = OLD.item_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;