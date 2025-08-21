-- Verificar estado de RLS en las tablas relevantes
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  (SELECT count(*) 
   FROM pg_policies 
   WHERE schemaname = n.nspname 
   AND tablename = c.relname 
   AND cmd = 'UPDATE') as update_policies_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('restaurants', 'dishes', 'events', 'user_favorites')
AND n.nspname = 'public'
ORDER BY tablename;

-- Verificar políticas UPDATE existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('restaurants', 'dishes', 'events')
AND cmd = 'UPDATE'
ORDER BY tablename, policyname;