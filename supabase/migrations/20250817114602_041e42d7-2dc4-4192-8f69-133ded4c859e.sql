
-- PASO 1: CRÍTICO - Despublicar tablas con datos sensibles de usuario del realtime
-- Estas tablas contienen datos personales que no deben estar en WAL público

ALTER PUBLICATION supabase_realtime DROP TABLE user_saved_restaurants;
ALTER PUBLICATION supabase_realtime DROP TABLE user_saved_dishes;  
ALTER PUBLICATION supabase_realtime DROP TABLE user_saved_events;

-- PASO 2: CRÍTICO - Configurar vistas como security_invoker para respetar RLS
-- Cambiar de SECURITY DEFINER a security_invoker = on

ALTER VIEW diet_summary SET (security_invoker = on);
ALTER VIEW dishes_full SET (security_invoker = on);
ALTER VIEW famous_areas_summary SET (security_invoker = on);
ALTER VIEW most_favorited_items SET (security_invoker = on);
ALTER VIEW active_fraud_alerts SET (security_invoker = on);

-- PASO 3: Añadir políticas RLS faltantes para tablas que tienen RLS habilitado pero sin políticas

-- Verificar y habilitar RLS en tablas críticas que podrían necesitarlo
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Política para analytics_events: usuarios solo pueden ver sus propios eventos
CREATE POLICY "Users can view own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- PASO 4: Asegurar que tablas públicas en realtime tengan RLS apropiado
-- restaurants y dishes permanecen en realtime pero con RLS para datos sensibles

-- Verificar que restaurants tenga políticas apropiadas para datos públicos
CREATE POLICY "Allow public read access to active restaurants" ON restaurants
    FOR SELECT USING (is_active = true AND deleted_at IS NULL);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- PASO 5: Configurar REPLICA IDENTITY para las tablas que permanecen en realtime
-- Solo para tablas públicas que seguirán en realtime

ALTER TABLE restaurants REPLICA IDENTITY FULL;
ALTER TABLE dishes REPLICA IDENTITY FULL;
ALTER TABLE events REPLICA IDENTITY FULL;
