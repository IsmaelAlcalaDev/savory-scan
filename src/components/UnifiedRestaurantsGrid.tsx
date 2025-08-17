
import { useEffect, useRef } from 'react'
import { useUnifiedRestaurantFeed } from '@/hooks/useUnifiedRestaurantFeed'
import InstrumentedRestaurantCard from './InstrumentedRestaurantCard'
import LoadMoreButton from './LoadMoreButton'
import PerformanceMetrics from './PerformanceMetrics'
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
}

export default function UnifiedRestaurantsGrid(props: UnifiedRestaurantsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { trackFeedImpression } = useAnalytics()
  
  const { 
    restaurants, 
    loading, 
    error, 
    hasMore, 
    loadMore,
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
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">No se encontraron restaurantes</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta cambiar los filtros de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Performance metrics - only show in development or for admin users */}
      {process.env.NODE_ENV === 'development' && (
        <div className="space-y-2">
          <PerformanceMetrics serverTiming={serverTiming} />
          <div className="text-xs text-muted-foreground">
            Sistema activo: {systemType === 'rpc' ? 'RPC Feed (Nuevo)' : 'Paginated Feed (Antiguo)'}
          </div>
        </div>
      )}

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
      
      {/* Show LoadMore button only for paginated system */}
      {systemType === 'paginated' && (
        <LoadMoreButton
          onLoadMore={loadMore}
          loading={false}
          hasMore={hasMore}
          className="mt-8"
        />
      )}
    </div>
  )
}
