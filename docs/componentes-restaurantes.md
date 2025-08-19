
# Componentes de /restaurantes - Sistema Simplificado

## Arquitectura actual (después de limpieza)

**Ruta principal**: `/restaurantes` → `FoodieSpotLayout` → `UnifiedRestaurantsTab` → `UnifiedRestaurantsGrid`

## Sistema de datos

### Hook principal
- **useUnifiedRestaurantFeed**: Sistema único que usa el RPC feed optimizado

### Feature flags activos
- `FF_HOME_RPC_FEED`: Controla el sistema RPC (actualmente activo)
- `FF_RESTAURANTES_RPC`: Controla el sistema de auditoría

### Endpoints principales
1. **search-restaurant-feed** (Edge Function) - Sistema RPC principal
2. **restaurants_full** (View) - Fallback si es necesario

## Componentes activos

### 1. **Navigation & Layout**
- **FoodieSpotLayout** - Layout principal con tabs
- **UnifiedRestaurantsTab** - Tab específico de restaurantes
- **DesktopHeader/MobileHeader** - Headers responsivos

### 2. **Search & Location**  
- **SecureSearchBar** - Barra de búsqueda principal
- **LocationModal** - Modal para selección de ubicación

### 3. **Filtering**
- **CuisineFilter** - Filtro de cocinas
- **PriceFilter** - Filtro de precios  
- **EstablishmentTypeFilter** - Filtro de tipos
- **DietFilter** - Filtro de dietas
- **RestaurantSortSelector** - Selector de ordenación

### 4. **Results Display**
- **UnifiedRestaurantsGrid** - Grid principal de resultados
- **InstrumentedRestaurantCard** - Cards individuales con analytics
- **RestaurantCard** - Card base
- **FavoriteButton** - Botón de favoritos

### 5. **States & UI**
- **Skeleton** (loading states)
- **PerformanceMetrics** (desarrollo)
- Estados de error y vacío integrados

## Flujo de datos simplificado

```
User Input → UnifiedRestaurantsTab → UnifiedRestaurantsGrid
    ↓
useUnifiedRestaurantFeed → search-restaurant-feed (Edge Function)
    ↓
PostgreSQL (restaurants_mv + índices espaciales)
    ↓
Normalized Results → InstrumentedRestaurantCard[]
```

## Realtime channels
1. **restaurants-favorites** - Actualización de favoritos
2. **analytics-events** - Tracking de eventos

## Componentes eliminados (limpieza)
- ❌ `useEnhancedRestaurants` - No se usaba
- ❌ `usePaginatedRestaurants` - Sistema obsoleto  
- ❌ `PaginatedRestaurantsGrid` - No se usaba
- ❌ `PaginatedRestaurantsTab` - No se usaba
- ❌ `optimized-restaurant-feed` - Edge function duplicada

## Shared con /platos
- `SecureSearchBar` ✅
- `LocationModal` ✅
- `FavoriteButton` ✅
- `RestaurantCard` ✅
- Analytics hooks ✅

El sistema ahora es mucho más simple y mantiene toda la funcionalidad necesaria.
