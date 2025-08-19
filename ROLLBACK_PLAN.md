
# Plan de Rollback - Restaurant Feed RPC

## Objetivo
Sistema de feature flag robusto que permite desactivar rápidamente el nuevo feed RPC si algo falla, con fallback automático al sistema antiguo.

## Arquitectura del Sistema

### 1. Feature Flag: `FF_RESTAURANT_FEED_RPC`
- **Por defecto**: `false` (usa sistema antiguo)
- **Activado**: `true` (usa nuevo sistema RPC)
- **Override local**: Variable de entorno `VITE_FF_RESTAURANT_FEED_RPC`

### 2. Componentes del Sistema

#### Sistema Nuevo (RPC)
- Hook: `useRestaurantFeed`
- Edge Function: `search-restaurant-feed`
- Componente: Basado en feed completo

#### Sistema Antiguo (Paginated)
- Hook: `usePaginatedRestaurants` 
- Query: Supabase direct queries
- Componente: Con paginación

#### Sistema Unificado
- Hook: `useUnifiedRestaurantFeed` (selector automático)
- Componente: `UnifiedRestaurantsGrid`
- Tab: `UnifiedRestaurantsTab`

## Procedimientos de Rollback

### Rollback Inmediato (< 1 minuto)

#### Opción 1: Variable de Entorno (Desarrollo)
```bash
# En .env.local
VITE_FF_RESTAURANT_FEED_RPC=false
```

#### Opción 2: Base de Datos (Producción)
```sql
-- Desactivar el flag RPC
UPDATE app_settings 
SET value = '{"enabled": false}'
WHERE key = 'FF_RESTAURANT_FEED_RPC';
```

#### Opción 3: Bypass en Edge Function
```javascript
// En la llamada al edge function, añadir:
{
  // ... otros parámetros
  bypass_rpc: true
}
```

### Configuración Inicial del Flag

```sql
-- Insertar el flag en la base de datos (desactivado por defecto)
INSERT INTO app_settings (key, value, description, is_public) 
VALUES (
  'FF_RESTAURANT_FEED_RPC',
  '{"enabled": false}',
  'Feature flag para activar el nuevo sistema RPC de restaurantes',
  true
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;
```

### Activación Gradual

#### Paso 1: Activar en desarrollo
```bash
VITE_FF_RESTAURANT_FEED_RPC=true npm run dev
```

#### Paso 2: Activar en producción
```sql
UPDATE app_settings 
SET value = '{"enabled": true}'
WHERE key = 'FF_RESTAURANT_FEED_RPC';
```

## Migración de Índices

### Índices requeridos para el sistema RPC
```sql
-- Índices para el feed RPC (si no existen)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_active 
ON restaurants USING GIST (ST_Point(longitude, latitude)) 
WHERE is_active = true AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_text_search 
ON restaurants USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_composite 
ON restaurants (is_active, deleted_at, google_rating, favorites_count);
```

### Índices requeridos para el sistema antiguo
```sql
-- Índices para el sistema paginado (si no existen)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_full_paginated 
ON restaurants_full (is_active, deleted_at, favorites_count, id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_full_rating 
ON restaurants_full (google_rating DESC, id) 
WHERE is_active = true;
```

## Monitoreo y Validación

### Métricas a Monitorear
1. **Performance**: Server-Timing headers
2. **Errores**: Logs de edge function vs queries directas
3. **Uso**: Qué sistema está siendo usado
4. **Resultados**: Consistencia entre sistemas

### Validación de Funcionamiento

#### Con Flag OFF (Sistema Antiguo)
- [ ] La home carga restaurantes correctamente
- [ ] La paginación funciona (botón "Cargar más")
- [ ] Los filtros funcionan correctamente
- [ ] No hay calls a edge functions de RPC
- [ ] Performance similar al comportamiento actual

#### Con Flag ON (Sistema Nuevo)
- [ ] La home carga restaurantes via RPC
- [ ] Los resultados son consistentes
- [ ] Las métricas de performance se muestran
- [ ] Los filtros funcionan correctamente
- [ ] Headers Server-Timing presentes

### Logs de Debugging
```javascript
// En consola del navegador verás:
console.log('useUnifiedRestaurantFeed: Using RPC system')
// o
console.log('useUnifiedRestaurantFeed: Using Paginated system')
```

## Scripts de Emergencia

### Script de Rollback Total
```sql
-- Desactivar todos los flags RPC
UPDATE app_settings 
SET value = '{"enabled": false}'
WHERE key IN ('FF_RESTAURANT_FEED_RPC', 'FF_HOME_RPC_FEED');

-- Verificar estado
SELECT key, value FROM app_settings 
WHERE key LIKE 'FF_%RPC%';
```

### Script de Limpieza de Performance
```sql
-- Limpiar datos de performance si es necesario
DELETE FROM perf_feed WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM perf_feed_samples WHERE sample_date < CURRENT_DATE - INTERVAL '7 days';
```

## Testing del Sistema

### Test de Rollback
1. Activar flag RPC
2. Verificar que funciona
3. Desactivar flag
4. Verificar que vuelve al sistema antiguo
5. Medir tiempo de transición

### Test de Consistencia
1. Hacer la misma búsqueda con ambos sistemas
2. Comparar resultados
3. Verificar que los datos son equivalentes

## Contactos de Emergencia

En caso de problemas críticos:
1. Desactivar flag via base de datos
2. Verificar logs de edge function
3. Monitorear performance metrics
4. Documentar el incident para mejoras futuras

---

**Nota**: Este sistema está diseñado para ser completamente backwards compatible. Con el flag desactivado, el comportamiento es idéntico al sistema actual.
