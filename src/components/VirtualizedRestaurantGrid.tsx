import { useEffect, useRef } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useInfiniteRestaurants } from '@/hooks/useInfiniteRestaurants';
import { useImageCache } from '@/hooks/useImageCache';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

interface VirtualizedRestaurantGridProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: readonly ("€" | "€€" | "€€€" | "€€€€")[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  isBudgetFriendly?: boolean;
  userLocationName?: string;
  onLoginRequired?: () => void;
}

export default function VirtualizedRestaurantGrid({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 1000,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow = false,
  isBudgetFriendly = false,
  userLocationName,
  onLoginRequired = () => {}
}: VirtualizedRestaurantGridProps) {
  const {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    totalLoaded
  } = useInfiniteRestaurants({
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly
  });

  const { preloadImages } = useImageCache({ enabled: true, preloadNextBatch: true });
  const preloadedBatches = useRef(new Set<number>());

  // Setup infinite scroll
  const { lastElementRef, shouldLoadMore } = useInfiniteScroll({
    threshold: 0.5,
    rootMargin: '200px',
    enabled: hasMore && !loading && !loadingMore
  });

  // Load more when intersection is detected
  useEffect(() => {
    if (shouldLoadMore && hasMore && !loading && !loadingMore) {
      console.log('VirtualizedRestaurantGrid: Loading more restaurants...');
      loadMore();
    }
  }, [shouldLoadMore, hasMore, loading, loadingMore, loadMore]);

  // Preload images for next batch
  useEffect(() => {
    if (restaurants.length > 0) {
      const currentBatch = Math.floor(restaurants.length / 20);
      
      if (!preloadedBatches.current.has(currentBatch)) {
        const imageUrls = restaurants
          .slice(currentBatch * 20, (currentBatch + 1) * 20)
          .map(restaurant => [restaurant.cover_image_url, restaurant.logo_url])
          .flat()
          .filter(Boolean) as string[];
        
        if (imageUrls.length > 0) {
          preloadImages(imageUrls);
          preloadedBatches.current.add(currentBatch);
        }
      }
    }
  }, [restaurants, preloadImages]);

  // Calculate the trigger point (50% through the list)
  const triggerIndex = Math.max(0, Math.floor(restaurants.length * 0.5));

  // Get display text for location
  const getLocationDisplay = () => {
    if (userLat && userLng) {
      return userLocationName || 'tu ubicación';
    }
    return 'España';
  };

  // Count restaurants with distance
  const nearbyRestaurants = restaurants.filter(r => r.distance_km !== undefined);
  const hasLocation = userLat && userLng;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron restaurantes</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta cambiar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results counter with improved location info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>
          {hasLocation ? (
            <>
              Mostrando {totalLoaded} restaurantes cerca de {getLocationDisplay()}
              {nearbyRestaurants.length > 0 && (
                <span className="font-medium text-foreground ml-1">
                  ({nearbyRestaurants.length} en tu zona)
                </span>
              )}
            </>
          ) : (
            <>Mostrando {totalLoaded} restaurantes populares en {getLocationDisplay()}</>
          )}
        </span>
        {hasMore && <span> • Cargando más automáticamente...</span>}
      </div>

      {/* Restaurant grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.id}
            ref={index === triggerIndex ? lastElementRef : undefined}
          >
            <RestaurantCard
              id={restaurant.id}
              name={restaurant.name}
              slug={restaurant.slug}
              description={restaurant.description}
              priceRange={restaurant.price_range}
              googleRating={restaurant.google_rating}
              googleRatingCount={restaurant.google_rating_count}
              distance={restaurant.distance_km}
              cuisineTypes={restaurant.cuisine_types}
              establishmentType={restaurant.establishment_type_name}
              services={restaurant.services}
              favoritesCount={restaurant.favorites_count}
              coverImageUrl={restaurant.cover_image_url}
              logoUrl={restaurant.logo_url}
              onLoginRequired={onLoginRequired}
            />
          </div>
        ))}

        {/* Loading more skeletons */}
        {loadingMore && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`loading-${i}`} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* End of results indicator */}
      {!hasMore && restaurants.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-px bg-border mx-auto mb-4" />
          <p>Has visto todos los restaurantes disponibles</p>
          <p className="text-sm mt-1">Total: {totalLoaded} restaurantes</p>
          {hasLocation && nearbyRestaurants.length > 0 && (
            <p className="text-xs mt-1">
              Incluyendo {nearbyRestaurants.length} cerca de ti y {totalLoaded - nearbyRestaurants.length} adicionales
            </p>
          )}
        </div>
      )}
    </div>
  );
}
