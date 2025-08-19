
# Auditoría Técnica - Ruta /restaurantes

## Resumen Ejecutivo

Implementación de optimizaciones quirúrgicas para la ruta `/restaurantes` mediante feature flag `FF_RESTAURANTES_RPC`, enfocándose exclusivamente en mejoras de data fetching, SQL, caché y telemetría sin modificar el diseño.

## Cambios Implementados

### 1. Base de Datos (SQL)

#### Nuevos Índices Optimizados
```sql
-- Índice compuesto para consultas frecuentes
idx_restaurants_audit_composite ON restaurants (is_active, deleted_at, favorites_count DESC, google_rating DESC, id)

-- Índice espacial optimizado
idx_restaurants_location_audit ON restaurants USING GIST (ST_Point(longitude, latitude))

-- Índice de búsqueda textual en español
idx_restaurants_text_search_audit ON restaurants USING GIN (to_tsvector('spanish', name || ' ' || description))
```

#### Vista Materializada
- **`mv_restaurants_feed`**: Precalcula aggregaciones costosas (cuisine_types, services, establishment_type)
- **Refresh automático**: Función `refresh_restaurants_feed_mv()` para actualización concurrente
- **Índices específicos**: Optimizado para consultas geoespaciales y por ID

#### RPC Function
- **`search_restaurant_feed()`**: Función SQL optimizada con parámetros flexibles
- **Security Invoker**: Aplica RLS del caller
- **Built-in logging**: Registra métricas de performance automáticamente

#### Tablas de Telemetría
- **`perf_feed`**: Métricas detalladas por consulta individual
- **`perf_feed_samples`**: Agregados diarios (p50, p95, p99, cache hit rate)

### 2. Hooks y Lógica de Negocio

#### Nuevos Hooks
- **`useRestaurantsAuditFeature`**: Manejo específico del feature flag `FF_RESTAURANTES_RPC`
- **`useOptimizedRestaurantFeed`**: Sistema optimizado con MV + RPC
- **`useAuditedRestaurantFeed`**: Router condicional entre sistemas
- **`useFeatureFlags`**: Extendido con `useRestaurantsAuditRpc()`

#### Componentes de Presentación
- **`AuditedRestaurantsGrid`**: Grid optimizado con métricas en vivo
- **`AuditedRestaurantsTab`**: Tab wrapper con configuración de sorting

### 3. Sistema de Caché (3 Niveles)

#### Nivel 1: Edge/CDN (Preparado)
- Cache keys normalizados por geohash y filtros
- Headers preparados para ISR: `Cache-Control: public, s-maxage=3600`

#### Nivel 2: Redis (Implementación futura)
- TTL: 60s para feeds, 300s para facetas
- Key pattern: `feed:v3:{geohash}:{filters}`
- Invalidación por eventos de actualización

#### Nivel 3: Database
- Vista materializada `mv_restaurants_feed`
- Índices optimizados para consultas frecuentes
- Aggregaciones precalculadas

### 4. Telemetría y Métricas

#### Server-Timing Headers
- Duración de consultas SQL registrada automáticamente
- Métricas expuestas en `performance.getEntriesByType('measure')`

#### Analytics Events
- Evento `optimized_restaurant_feed` con metadata completa
- Propiedades: result_count, filtros aplicados, performance metrics
- Non-blocking: No afecta experiencia de usuario

#### Monitoreo en Tiempo Real
- Canal Realtime filtrado por IDs visibles
- Actualización de favorites_count en vivo
- Event-driven updates para cambios de estado

## Compatibilidad y Rollback

### Estado Actual
- **Feature Flag**: `FF_RESTAURANTES_RPC = false` (desactivado por defecto)
- **Comportamiento**: Idéntico al sistema actual cuando flag está OFF
- **Sistema activo**: `useUnifiedRestaurantFeed` (fallback)

### Activación
```sql
UPDATE app_settings 
SET value = '{"enabled": true}' 
WHERE key = 'FF_RESTAURANTES_RPC';
```

### Rollback de Emergencia
```sql
UPDATE app_settings 
SET value = '{"enabled": false}' 
WHERE key = 'FF_RESTAURANTES_RPC';
```

### Cleanup (si es necesario)
```sql
-- Eliminar índices
DROP INDEX CONCURRENTLY idx_restaurants_audit_composite;
DROP INDEX CONCURRENTLY idx_restaurants_location_audit;
DROP INDEX CONCURRENTLY idx_restaurants_text_search_audit;

-- Eliminar vista materializada
DROP MATERIALIZED VIEW mv_restaurants_feed;

-- Eliminar tablas de telemetría
DROP TABLE perf_feed_samples;
DROP TABLE perf_feed;

-- Eliminar funciones
DROP FUNCTION search_restaurant_feed;
DROP FUNCTION refresh_restaurants_feed_mv;
DROP FUNCTION log_feed_performance;
```

## Validación y Testing

### Criterios de Éxito
1. **Performance**: Mejora >50% en p95 de respuesta
2. **Compatibilidad**: 100% de funcionalidad mantenida
3. **Rollback**: <1 minuto para desactivar
4. **Métricas**: Dashboard funcional con datos en tiempo real

### Tests Requeridos
1. **SQL**: `EXPLAIN ANALYZE` de todas las consultas nuevas
2. **E2E**: User journey completo en ambos modos
3. **Smoke**: Cache hit/miss scenarios
4. **Load**: Stress test con >1000 restaurantes

### Monitoring
- P50/P95/P99 en tabla `perf_feed_samples`
- Cache hit rate promedio >80%
- Zero downtime durante activación/desactivación
- Error rate <0.1% en analytics events

## Próximos Pasos

1. **Testing exhaustivo** en staging
2. **Gradual rollout** (5% → 25% → 50% → 100%)
3. **Redis implementation** para Nivel 2 de caché
4. **Auto-refresh scheduling** para MV (pg_cron)
5. **Dashboard** de métricas en tiempo real

---

**Rama**: `feat/audit-restaurantes`  
**Feature Flag**: `FF_RESTAURANTES_RPC`  
**Estado**: ✅ Implementado, pendiente testing  
**Rollback**: ✅ Un comando SQL, <1min  
