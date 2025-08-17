
import { useEffect, useRef } from 'react'
import { useUnifiedRestaurantFeed } from '@/hooks/useUnifiedRestaurantFeed'
import InstrumentedRestaurantCard from './InstrumentedRestaurantCard'
import PerformanceMetrics from './PerformanceMetrics'
import SimpleDietFilterWithCounts from './SimpleDietFilterWithCounts'
import { Skeleton } from '@/components/ui/skeleton'
import { preloadRestaurantImages } from '@/utils/imagePreloader'
import { useAnalytics } from '@/hooks/useAnalytics'

interface UnifiedRestaurantsGridProps {
  searchQuery?: string
  userLat?: number
  userLng?: number
  maxDistance?: number
  cuisineTypeIds?: number[]
  priceRanges?: string[]
  isHighRated?: boolean
  selectedEstablishmentTypes?: number[]
  selectedDietTypes?: number[]
  selectedDietCategories?: string[]
  isOpenNow?: boolean
  sortBy?: 'distance' | 'rating' | 'favorites'
  onDietCategoryChange?: (categories: string[]) => void
}

export default function UnifiedRestaurantsGrid(props: UnifiedRestaurantsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trackFeedImpression } = useAnalytics()
  
  const { 
    restaurants, 
    loading, 
    error, 
    refetch,
    serverTiming,
    systemType
  } = useUnifiedRestaurantFeed(props)

  // Preload first batch of images for better LCP
  useEffect(() => {
    if (restaurants.length > 0) {
      preloadRestaurantImages(restaurants.slice(0, 6))
    }
  }, [restaurants])

  // Track feed impression when restaurants load
  useEffect(() => {
    if (restaurants.length > 0 && !loading) {
      const restaurantIds = restaurants.map(r => r.id)
      trackFeedImpression(restaurantIds)
    }
  }, [restaurants, loading, trackFeedImpression])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Diet filter skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Show diet filter even on error */}
        <SimpleDietFilterWithCounts
          selectedDietCategories={props.selectedDietCategories || []}
          onDietCategoryChange={props.onDietCategoryChange || (() => {})}
          searchQuery={props.searchQuery}
          userLat={props.userLat}
          userLng={props.userLng}
          maxDistance={props.maxDistance}
          cuisineTypeIds={props.cuisineTypeIds}
          priceRanges={props.priceRanges}
          selectedEstablishmentTypes={props.selectedEstablishmentTypes}
          minRating={props.isHighRated ? 4.5 : undefined}
        />
        
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Optimized Diet Filter */}
      <SimpleDietFilterWithCounts
        selectedDietCategories={props.selectedDietCategories || []}
        onDietCategoryChange={props.onDietCategoryChange || (() => {})}
        searchQuery={props.searchQuery}
        userLat={props.userLat}
        userLng={props.userLng}
        maxDistance={props.maxDistance}
        cuisineTypeIds={props.cuisineTypeIds}
        priceRanges={props.priceRanges}
        selectedEstablishmentTypes={props.selectedEstablishmentTypes}
        minRating={props.isHighRated ? 4.5 : undefined}
      />

      {/* Performance metrics - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="space-y-2">
          <PerformanceMetrics serverTiming={serverTiming} />
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              Sistema activo: {
                systemType === 'rpc-optimized' ? '🚀 RPC OPTIMIZADO (search_restaurant_feed)' :
                systemType === 'legacy' ? '📊 Sistema Legacy' : 
                systemType === 'loading' ? 'Cargando...' :
                'Sistema Unificado'
              }
            </div>
            {systemType === 'rpc-optimized' && (
              <div className="flex items-center gap-2">
                <span className="text-green-600">
                  ⚡ PostGIS + ST_DWithin optimizado
                </span>
                <span className="text-blue-600">
                  📊 Estadísticas pre-calculadas (20% mínimo)
                </span>
                <span className="text-purple-600">
                  🔍 Búsqueda trigram + unaccent
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {restaurants.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No se encontraron restaurantes</p>
          <p className="text-sm text-muted-foreground mt-2">
            Intenta cambiar los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="restaurants-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant, index) => (
            <div key={restaurant.id} data-restaurant-id={restaurant.id}>
              <InstrumentedRestaurantCard
                id={restaurant.id}
                name={restaurant.name}
                slug={restaurant.slug}
                description={restaurant.description}
                priceRange={restaurant.price_range}
                googleRating={restaurant.google_rating}
                googleRatingCount={restaurant.google_rating_count}
                distance={restaurant.distance_km}
                cuisineTypes={restaurant.cuisine_types}
                establishmentType={restaurant.establishment_type}
                services={restaurant.services}
                favoritesCount={restaurant.favorites_count}
                coverImageUrl={restaurant.cover_image_url}
                logoUrl={restaurant.logo_url}
                priority={index < 4}
                position={index}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
