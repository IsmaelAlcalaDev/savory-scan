
-- Eliminar todos los triggers de updated_at que puedan estar causando problemas
DROP TRIGGER IF EXISTS set_updated_at ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS update_updated_at_column ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trigger_update_updated_at ON public.user_saved_restaurants;

-- Verificar si hay otros triggers que usen updated_at en user_saved_restaurants
-- y eliminar cualquier trigger genérico de actualización automática
DROP TRIGGER IF EXISTS handle_updated_at ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS auto_updated_at ON public.user_saved_restaurants;

-- Asegurarnos de que el trigger de conteo de favoritos esté correctamente definido
DROP TRIGGER IF EXISTS tg_favcount_user_saved_restaurants ON public.user_saved_restaurants;

CREATE TRIGGER tg_favcount_user_saved_restaurants
  AFTER INSERT OR UPDATE OR DELETE ON public.user_saved_restaurants
  FOR EACH ROW EXECUTE FUNCTION public.tg_favcount_user_saved_restaurants();

-- Verificar también user_saved_dishes y user_saved_events por si tienen el mismo problema
DROP TRIGGER IF EXISTS set_updated_at ON public.user_saved_dishes;
DROP TRIGGER IF EXISTS set_updated_at ON public.user_saved_events;
