
-- 1) Eliminar los triggers problemáticos de updated_at
DROP TRIGGER IF EXISTS trg_usr_fav_rest_set_updated_at ON public.user_saved_restaurants;
DROP TRIGGER IF EXISTS trg_usr_fav_dish_set_updated_at ON public.user_saved_dishes;
DROP TRIGGER IF EXISTS trg_usr_fav_evt_set_updated_at ON public.user_saved_events;

-- 2) Comprobación (solo lectura)
-- Triggers en user_saved_restaurants
SELECT t.tgname, p.proname, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'user_saved_restaurants' AND NOT t.tgisinternal;

-- Triggers en user_saved_dishes
SELECT t.tgname, p.proname, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'user_saved_dishes' AND NOT t.tgisinternal;

-- Triggers en user_saved_events
SELECT t.tgname, p.proname, pg_get_triggerdef(t.oid)
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'user_saved_events' AND NOT t.tgisinternal;
