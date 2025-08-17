
# Componentes de la Ruta /restaurantes

## Estructura de Componentes

### 1. NAVEGACIÓN (Compartida)

#### DesktopHeader
- **Función**: Header principal con navegación en escritorio
- **Hooks**: useAuth, useUserPreferences
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### MobileHeader  
- **Función**: Header adaptado para móviles
- **Hooks**: useAuth, useUserPreferences
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### TabletHeader
- **Función**: Header adaptado para tablets
- **Hooks**: useAuth, useUserPreferences  
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### BottomNavigation
- **Función**: Navegación inferior en móviles
- **Hooks**: useAuth
- **Endpoints**: Ninguno
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

### 2. LOCALIZACIÓN Y UBICACIÓN

#### LocationModal
- **Función**: Modal para configurar ubicación del usuario
- **Hooks**: useUserPreferences
- **Endpoints**: Geolocation API, localStorage
- **Realtime**: No
- **Escribe DB**: No (solo localStorage)
- **Compartido con /platos**: ✅ Sí

#### LocationInfo
- **Función**: Muestra ubicación actual del usuario
- **Hooks**: useUserPreferences
- **Endpoints**: Geolocation API
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

### 3. BÚSQUEDA Y FILTROS

#### InlineSearchBar
- **Función**: Barra de búsqueda integrada en layout
- **Hooks**: useState (local)
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### SearchBar
- **Función**: Componente de búsqueda principal
- **Hooks**: useState, useDebounce
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### SecureSearchBar
- **Función**: Versión segura de barra búsqueda
- **Hooks**: useState, useAuth
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### InstrumentedSearchBar
- **Función**: SearchBar con telemetría
- **Hooks**: useAnalytics, useState
- **Endpoints**: analytics_events
- **Realtime**: No
- **Escribe DB**: ✅ Sí (eventos analytics)
- **Compartido con /platos**: ✅ Sí

### 4. SISTEMA DE FILTROS

#### CuisineFilter
- **Función**: Filtro por tipos de cocina
- **Hooks**: useCuisineTypes
- **Endpoints**: /rest/v1/cuisine_types
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### CuisineFilterWithCounts
- **Función**: Filtro cocinas con contadores
- **Hooks**: useCuisineTypes, useRestaurantCounts
- **Endpoints**: /rest/v1/cuisine_types, agregaciones
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### EstablishmentTypeFilter
- **Función**: Filtro por tipo de establecimiento  
- **Hooks**: useEstablishmentTypes
- **Endpoints**: /rest/v1/establishment_types
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### EstablishmentTypeFilterWithCounts
- **Función**: Filtro establecimientos con contadores
- **Hooks**: useEstablishmentTypes, useRestaurantCounts
- **Endpoints**: /rest/v1/establishment_types, agregaciones
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### PriceFilter
- **Función**: Filtro por rangos de precio
- **Hooks**: usePriceRanges
- **Endpoints**: /rest/v1/price_ranges
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### PriceFilterWithCounts  
- **Función**: Filtro precios con contadores
- **Hooks**: usePriceRanges, useRestaurantCounts
- **Endpoints**: /rest/v1/price_ranges, agregaciones
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### DietFilter
- **Función**: Filtro por tipos de dieta
- **Hooks**: useDietTypes
- **Endpoints**: /rest/v1/diet_types
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### SimpleDietFilter
- **Función**: Versión simplificada filtro dieta
- **Hooks**: useDietTypes
- **Endpoints**: /rest/v1/diet_types
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### SimpleDietFilterWithCounts
- **Función**: Filtro dieta simple con contadores
- **Hooks**: useDietTypes, useRestaurantDietStats
- **Endpoints**: /rest/v1/diet_types, restaurant_diet_stats
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### DietFilterWithPercentages
- **Función**: Filtro dieta con porcentajes
- **Hooks**: useDietTypes, useRestaurantDietStats
- **Endpoints**: /rest/v1/diet_types, restaurant_diet_stats
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### UnifiedFiltersModal
- **Función**: Modal unificado con todos los filtros
- **Hooks**: Todos los hooks de filtros
- **Endpoints**: Todos los endpoints de filtros
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí (parcialmente)

### 5. ORDENACIÓN Y CONFIGURACIÓN

#### RestaurantSortSelector
- **Función**: Selector de ordenación de restaurantes
- **Hooks**: useState
- **Endpoints**: Ninguno
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No (específico restaurantes)

#### ViewModeToggle
- **Función**: Alternar entre vistas (grid/lista)
- **Hooks**: useState
- **Endpoints**: Ninguno
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

### 6. GRIDS DE RESULTADOS

#### UnifiedRestaurantsGrid
- **Función**: Grid principal de restaurantes (sistema unificado)
- **Hooks**: useUnifiedRestaurantFeed, useAnalytics
- **Endpoints**: Múltiples (según sistema activo)
- **Realtime**: ✅ Sí (favorites_count)
- **Escribe DB**: ✅ Sí (analytics_events)
- **Compartido con /platos**: ❌ No

#### AuditedRestaurantsGrid  
- **Función**: Grid optimizado para auditoría
- **Hooks**: useAuditedRestaurantFeed, useAnalytics
- **Endpoints**: RPC search_restaurant_feed o fallback
- **Realtime**: ✅ Sí (favorites_count)
- **Escribe DB**: ✅ Sí (analytics_events)
- **Compartido con /platos**: ❌ No

#### PaginatedRestaurantsGrid
- **Función**: Grid con paginación tradicional
- **Hooks**: usePaginatedRestaurants, useAnalytics
- **Endpoints**: /rest/v1/restaurants (paginado)
- **Realtime**: ✅ Sí (favorites_count)
- **Escribe DB**: ✅ Sí (analytics_events)
- **Compartido con /platos**: ❌ No

#### LoadMoreButton
- **Función**: Botón para cargar más resultados
- **Hooks**: Ninguno (recibe props)
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

### 7. CARDS DE RESTAURANTES

#### RestaurantCard
- **Función**: Card básica de restaurante
- **Hooks**: Ninguno (recibe props)
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No

#### InstrumentedRestaurantCard
- **Función**: Card con telemetría
- **Hooks**: useAnalytics
- **Endpoints**: analytics_events
- **Realtime**: No
- **Escribe DB**: ✅ Sí (eventos analytics)
- **Compartido con /platos**: ❌ No

#### LazyRestaurantCard
- **Función**: Card con carga diferida
- **Hooks**: useIntersectionObserver
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ❌ No

### 8. SISTEMA DE FAVORITOS

#### FavoriteButton
- **Función**: Botón básico de favoritos
- **Hooks**: useAuth, useFavorites
- **Endpoints**: /rest/v1/user_favorites
- **Realtime**: No
- **Escribe DB**: ✅ Sí (user_favorites)
- **Compartido con /platos**: ✅ Sí

#### InstrumentedFavoriteButton
- **Función**: Botón favoritos con telemetría
- **Hooks**: useAuth, useFavorites, useAnalytics
- **Endpoints**: /rest/v1/user_favorites, analytics_events
- **Realtime**: ✅ Sí (actualiza counters en tiempo real)
- **Escribe DB**: ✅ Sí (user_favorites, analytics_events)
- **Compartido con /platos**: ✅ Sí

### 9. ESTADOS Y FEEDBACK

#### Skeleton (UI)
- **Función**: Placeholders de carga
- **Hooks**: Ninguno
- **Endpoints**: Ninguno
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### PerformanceMetrics
- **Función**: Métricas de rendimiento en desarrollo
- **Hooks**: Ninguno (recibe props)
- **Endpoints**: Ninguno
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

#### PerformanceMonitor
- **Función**: Monitor general de performance
- **Hooks**: usePerformanceMonitor
- **Endpoints**: Ninguno directo
- **Realtime**: No
- **Escribe DB**: No
- **Compartido con /platos**: ✅ Sí

### 10. CONTENEDORES PRINCIPALES

#### FoodieSpotLayout
- **Función**: Layout principal de la aplicación
- **Hooks**: useAuth, useUserPreferences
- **Endpoints**: Múltiples (a través de children)
- **Realtime**: No directo
- **Escribe DB**: No directo
- **Compartido con /platos**: ✅ Sí

#### UnifiedRestaurantsTab
- **Función**: Tab principal de restaurantes (sistema unificado)
- **Hooks**: useUserPreferences, useUnifiedRestaurantFeed
- **Endpoints**: Múltiples (según configuración)
- **Realtime**: Sí (a través del grid)
- **Escribe DB**: Sí (a través del grid)
- **Compartido con /platos**: ❌ No

#### AuditedRestaurantsTab
- **Función**: Tab optimizado para auditoría
- **Hooks**: useUserPreferences, useAuditedRestaurantFeed
- **Endpoints**: RPC search_restaurant_feed o fallback
- **Realtime**: Sí (a través del grid)
- **Escribe DB**: Sí (a través del grid)
- **Compartido con /platos**: ❌ No

#### PaginatedRestaurantsTab
- **Función**: Tab con paginación tradicional
- **Hooks**: useUserPreferences, usePaginatedRestaurants
- **Endpoints**: /rest/v1/restaurants (paginado)
- **Realtime**: Sí (a través del grid)
- **Escribe DB**: Sí (a través del grid)
- **Compartido con /platos**: ❌ No

## Hooks de Datos Principales

### useUnifiedRestaurantFeed
- **Función**: Hook principal que decide entre RPC y paginado
- **Endpoints**: Dinámico (RPC o REST)
- **Feature Flags**: FF_HOME_RPC_FEED
- **Realtime**: ✅ Sí (favorites_count)

### useAuditedRestaurantFeed  
- **Función**: Hook que decide entre optimizado y unificado
- **Endpoints**: RPC search_restaurant_feed o fallback
- **Feature Flags**: FF_RESTAURANTES_RPC
- **Realtime**: ✅ Sí (favorites_count)

### useOptimizedRestaurantFeed
- **Función**: Hook optimizado con MV + RPC
- **Endpoints**: RPC search_restaurant_feed
- **Feature Flags**: FF_RESTAURANTES_RPC
- **Realtime**: ✅ Sí (favorites_count)

### usePaginatedRestaurants
- **Función**: Hook tradicional con paginación
- **Endpoints**: /rest/v1/restaurants
- **Feature Flags**: Ninguno
- **Realtime**: ✅ Sí (favorites_count)

### useRestaurantFeed
- **Función**: Hook RPC vía edge function
- **Endpoints**: Edge function search-restaurant-feed
- **Feature Flags**: FF_HOME_RPC_FEED
- **Realtime**: ✅ Sí (favorites_count)

## Flujo de Datos

```
[Usuario] 
    ↓
[LocationModal] → [useUserPreferences] → localStorage + geolocation
    ↓
[FoodieSpotLayout]
    ↓
[UnifiedRestaurantsTab] → [RestaurantSortSelector]
    ↓
[UnifiedRestaurantsGrid] → [useUnifiedRestaurantFeed]
    ↓
[Feature Flag Check] → FF_HOME_RPC_FEED
    ↓
┌─────────────────┬─────────────────┐
│ RPC System      │ Paginated       │
│ ↓               │ ↓               │
│ [useRestaurantFeed] │ [usePaginatedRestaurants] │
│ ↓               │ ↓               │
│ Edge Function   │ REST API        │
│ search-restaurant-feed │ /restaurants    │
└─────────────────┴─────────────────┘
    ↓
[Restaurant Data] → [InstrumentedRestaurantCard]
    ↓
[InstrumentedFavoriteButton] → Realtime Channel "restaurants-favorites"
    ↓
[Analytics Events] → analytics_events table
    ↓
[User Favorites] → user_favorites table
```

## Endpoints Principales

1. **GET /rest/v1/restaurants** - Lista paginada de restaurantes
2. **RPC search_restaurant_feed()** - Búsqueda optimizada con MV
3. **Edge Function search-restaurant-feed** - RPC vía edge function
4. **GET /rest/v1/cuisine_types** - Tipos de cocina
5. **GET /rest/v1/establishment_types** - Tipos de establecimiento
6. **GET /rest/v1/price_ranges** - Rangos de precio
7. **GET /rest/v1/diet_types** - Tipos de dieta
8. **POST /rest/v1/user_favorites** - Crear favorito
9. **DELETE /rest/v1/user_favorites** - Eliminar favorito
10. **POST /rest/v1/analytics_events** - Eventos de telemetría

## Realtime Channels

1. **"restaurants-favorites"** - Actualización de favorites_count
2. **"restaurants-favorites-feed"** - Canal específico para el feed
3. **"restaurants-favorites-optimized"** - Canal para sistema optimizado

## Feature Flags

1. **FF_HOME_RPC_FEED** - Activa sistema RPC en feed principal
2. **FF_RESTAURANTES_RPC** - Activa sistema optimizado con auditoría

## Estados de Carga

- **Loading**: Skeletons en grid (12 placeholders)
- **Error**: Mensaje + botón "Reintentar"
- **Empty**: "No se encontraron restaurantes" + sugerencia filtros
- **Success**: Grid con resultados + métricas performance (dev)

## Componentes Compartidos con /platos

✅ **Compartidos**: Headers, navegación, búsqueda, filtros básicos, favoritos, UI components
❌ **No compartidos**: Grids específicos de restaurantes, hooks de feed, sorting de restaurantes
