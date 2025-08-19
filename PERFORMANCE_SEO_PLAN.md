
# Plan de Optimización de Rendimiento y SEO - feat/home-perf-seo

## Objetivo
Optimizar la página de inicio con enfoque quirúrgico en data fetching, SQL y endpoints sin alterar el diseño existente.

## Feature Flag
- `FF_HOME_RPC_FEED`: Controla el nuevo sistema de feed optimizado para la página de inicio

## Cambios Planificados

### 1. Optimización de Data Fetching
- **Hook Optimizado**: Crear `useOptimizedHomeData` que combine múltiples queries
- **RPC Function**: Nueva función `get_home_feed_data` que retorne datos pre-agregados
- **Caching Strategy**: Implementar cache inteligente con invalidación selectiva
- **Lazy Loading**: Cargar secciones bajo demanda según viewport

### 2. Optimizaciones SQL
- **Índices Nuevos**: 
  - `idx_restaurants_home_feed` (active, published, featured, rating, favorites)
  - `idx_dishes_trending` (active, featured, favorites_week DESC)
  - `idx_events_upcoming` (active, event_date, restaurant_id)
- **Views Materializadas**: 
  - `home_featured_restaurants` (top restaurants para homepage)
  - `trending_dishes_week` (platos trending de la semana)
- **Queries Optimizadas**: Reescribir queries N+1 con JOINs optimizados

### 3. Nuevos Endpoints RPC
- `get_home_feed_data()`: Feed completo optimizado
- `get_featured_content()`: Contenido destacado con scores pre-calculados
- `get_trending_metrics()`: Métricas de tendencias agregadas

### 4. Compatibilidad API (Backward Compatibility)
- **Views de Compatibilidad**: Mantener nombres originales como views
- **Hook Wrappers**: Los hooks existentes funcionarán sin cambios
- **Gradual Rollout**: Feature flag permite rollback inmediato

### 5. Optimizaciones SEO
- **Meta Tags Dinámicos**: Pre-generar meta tags basados en contenido popular
- **Structured Data**: JSON-LD para restaurantes y platos destacados  
- **Image Optimization**: Lazy loading y progressive enhancement
- **Core Web Vitals**: Optimizar LCP, FID y CLS específicamente

### 6. Métricas y Monitoreo
- **Performance Tracking**: Métricas de tiempo de carga antes/después
- **Feature Flag Analytics**: Comparación A/B automática
- **SQL Performance**: Monitoring de query execution time

## Implementación Faseada

### Fase 1: Base Infrastructure
- [ ] Feature flag setup
- [ ] Nuevos índices SQL
- [ ] RPC functions base

### Fase 2: Data Layer Optimization  
- [ ] Hook optimizado
- [ ] Views materializadas
- [ ] Cache strategy

### Fase 3: SEO Enhancements
- [ ] Meta tags dinámicos
- [ ] Structured data
- [ ] Image optimization

### Fase 4: Testing & Rollout
- [ ] Performance testing
- [ ] A/B testing setup
- [ ] Gradual feature flag rollout

## Guardarraíles Técnicos
✅ NO modificar JSX/HTML/CSS/Tailwind existente
✅ Solo tocar data fetching, SQL, endpoints, índices
✅ Mantener compatibilidad API completa
✅ Feature flag para rollback seguro
✅ Views de compatibilidad para tablas renombradas

## Métricas de Éxito
- **LCP**: < 2.5s (actualmente ~4s)
- **FID**: < 100ms (actualmente ~200ms) 
- **CLS**: < 0.1 (actualmente ~0.3)
- **SQL Query Time**: Reducción 60%+ en queries principales
- **Bundle Size**: Mantener o reducir (no aumentar)

## Rollback Plan
- Desactivar `FF_HOME_RPC_FEED` revierte a comportamiento anterior
- Views de compatibilidad mantienen funcionalidad existente
- Índices nuevos no afectan queries existentes
