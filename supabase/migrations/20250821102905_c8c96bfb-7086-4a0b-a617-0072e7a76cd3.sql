-- 1. Verificar si existe el trigger
SELECT tgname, tgrelid::regclass, prosrc
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_update_unified_favorites_count';

-- 2. Si no existe, crearlo:
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
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 3. Crear el trigger
DROP TRIGGER IF EXISTS trigger_update_unified_favorites_count ON user_favorites;
CREATE TRIGGER trigger_update_unified_favorites_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();