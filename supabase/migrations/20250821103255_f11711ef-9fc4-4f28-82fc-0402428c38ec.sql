-- 1. Crear/actualizar la función del trigger
CREATE OR REPLACE FUNCTION public.update_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador cuando se agrega favorito
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
    -- Decrementar contador cuando se quita favorito
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

-- 2. Crear el trigger en la tabla user_favorites
DROP TRIGGER IF EXISTS trigger_update_unified_favorites_count ON user_favorites;
CREATE TRIGGER trigger_update_unified_favorites_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();