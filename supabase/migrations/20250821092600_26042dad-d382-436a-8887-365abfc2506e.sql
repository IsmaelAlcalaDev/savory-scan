-- Create unified user_favorites table
CREATE TABLE user_favorites (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id bigint NOT NULL,
    item_type text CHECK (item_type IN ('restaurant', 'dish', 'event')) NOT NULL,
    saved_at timestamptz DEFAULT now(),
    saved_from text DEFAULT 'button',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, item_id, item_type)
);

-- Enable RLS on the new table
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the unified favorites table
CREATE POLICY "Users can view their own favorites" 
ON user_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON user_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create unified trigger function
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador según el tipo
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
    -- Decrementar contador según el tipo
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

-- Create the unified trigger
CREATE TRIGGER trigger_update_unified_favorites_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();