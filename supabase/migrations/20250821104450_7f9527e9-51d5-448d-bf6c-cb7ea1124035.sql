-- Verificar estado de RLS en las tablas relevantes
SELECT 
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('restaurants', 'dishes', 'events', 'user_favorites')
AND n.nspname = 'public'
ORDER BY c.relname;

-- Verificar políticas UPDATE existentes en estas tablas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('restaurants', 'dishes', 'events')
ORDER BY tablename, policyname;