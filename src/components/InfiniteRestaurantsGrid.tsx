
import { useEffect, useRef, useCallback } from 'react';
import { useInfiniteRestaurants } from '@/hooks/useInfiniteRestaurants';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MapPin } from 'lucide-react';

interface InfiniteRestaurantsGridProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  sortBy?: 'recommended' | 'distance';
}

export default function InfiniteRestaurantsGrid({
  searchQuery,
  userLat,
  userLng,
  cuisineTypeIds,
  priceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow,
  sortBy = 'recommended'
}: InfiniteRestaurantsGridProps) {
  const {
    restaurants,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  } = useInfiniteRestaurants({
    searchQuery,
    userLat,
    userLng,
    cuisineTypeIds,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    sortBy
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loadingMore) {
      console.log('InfiniteRestaurantsGrid: Loading more restaurants...');
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Distance info */}
        {userLat && userLng && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <MapPin className="h-4 w-4" />
            <span>Mostrando restaurantes hasta 5km de distancia</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar restaurantes</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No hay restaurantes disponibles</h3>
        <p className="text-muted-foreground">
          {userLat && userLng 
            ? "No se encontraron restaurantes en un radio de 5km. Intenta cambiar tu ubicación o ajustar los filtros."
            : "Intenta ajustar tus filtros o buscar en una zona diferente."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Distance info */}
      {userLat && userLng && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <MapPin className="h-4 w-4" />
          <span>Mostrando restaurantes hasta 5km de distancia • {restaurants.length} encontrados</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            description={restaurant.description}
            coverImageUrl={restaurant.cover_image_url}
            cuisineTypes={restaurant.cuisine_types}
            priceRange={restaurant.price_range}
            googleRating={restaurant.google_rating}
            distance={restaurant.distance_km}
            establishmentType={restaurant.establishment_type}
            slug={restaurant.slug}
            favoritesCount={restaurant.favorites_count}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`loading-${index}`} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={loadMoreRef} className="h-4" />

      {/* End of results message */}
      {!hasMore && restaurants.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Has visto todos los restaurantes disponibles</p>
          {userLat && userLng && (
            <p className="text-sm mt-2">Mostrando solo restaurantes hasta 5km de distancia</p>
          )}
        </div>
      )}
    </div>
  );
}
