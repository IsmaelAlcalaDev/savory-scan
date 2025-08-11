
-- 1) Buscar funciones en schema public que aún contengan 'usr.id'
SELECT 
  n.nspname AS schema,
  p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '%usr.id%';

-- 2) Buscar funciones que usen alias 'usr.' (podría indicar comparaciones con columnas inexistentes)
SELECT 
  n.nspname AS schema,
  p.proname AS function_name
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) ILIKE '% usr.%';

-- 3) Listar TODOS los triggers no internos en user_saved_restaurants (para confirmar que solo queda 1)
SELECT 
  t.tgname AS trigger_name,
  t.tgenabled AS enabled,
  pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname = 'user_saved_restaurants'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4) Confirmar columnas reales de user_saved_restaurants (para verificar que no existe 'id')
SELECT 
  column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_saved_restaurants'
ORDER BY ordinal_position;

-- 5) Buscar vistas en public que contengan 'usr.id' en su definición
SELECT 
  schemaname AS schema,
  viewname,
  'VIEW' AS object_type
FROM pg_views
WHERE schemaname = 'public'
  AND definition ILIKE '%usr.id%'

UNION ALL

-- Y vistas materializadas
SELECT 
  n.nspname AS schema,
  c.relname AS viewname,
  'MATERIALIZED VIEW' AS object_type
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_depend d ON d.refobjid = c.oid
WHERE n.nspname = 'public'
  AND c.relkind = 'm'
  AND pg_get_viewdef(c.oid) ILIKE '%usr.id%';
