
-- Revisar todos los triggers activos en user_saved_restaurants
SELECT 
    t.tgname AS trigger_name,
    p.proname AS function_name,
    CASE t.tgenabled 
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
    END AS status,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'user_saved_restaurants' 
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Revisar todos los triggers activos en restaurants
SELECT 
    t.tgname AS trigger_name,
    p.proname AS function_name,
    CASE t.tgenabled 
        WHEN 'O' THEN 'ENABLED'
        WHEN 'D' THEN 'DISABLED'
        WHEN 'R' THEN 'REPLICA'
        WHEN 'A' THEN 'ALWAYS'
        ELSE 'UNKNOWN'
    END AS status,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
  AND c.relname = 'restaurants' 
  AND NOT t.tgisinternal
  AND p.proname LIKE '%fav%'
ORDER BY t.tgname;
