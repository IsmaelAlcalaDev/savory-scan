-- Verificar estado del trigger
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trigger_update_unified_favorites_count';

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_update_unified_favorites_count ON user_favorites;
CREATE TRIGGER trigger_update_unified_favorites_count
  AFTER INSERT OR DELETE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();