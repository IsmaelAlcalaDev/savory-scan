import { useEffect, useRef } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useInfiniteDishes } from '@/hooks/useInfiniteDishes';
import { useImageCache } from '@/hooks/useImageCache';
import AllDishCard from './AllDishCard';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedDishesGridProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  selectedDietTypes?: number[];
  selectedPriceRanges?: readonly ("€" | "€€" | "€€€" | "€€€€")[];
  locationReady?: boolean;
}

export default function VirtualizedDishesGrid({
  searchQuery = '',
  userLat,
  userLng,
  selectedDietTypes,
  selectedPriceRanges,
  locationReady = true
}: VirtualizedDishesGridProps) {
  const {
    dishes,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    totalLoaded
  } = useInfiniteDishes({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedPriceRanges,
    enabled: locationReady
  });

  const { preloadImages } = useImageCache({ enabled: true, preloadNextBatch: true });
  const preloadedBatches = useRef(new Set<number>());

  // Setup infinite scroll - trigger when user reaches 50% of current viewport
  const { lastElementRef, shouldLoadMore } = useInfiniteScroll({
    threshold: 0.5,
    rootMargin: '200px',
    enabled: hasMore && !loading && !loadingMore
  });

  // Load more when intersection is detected
  useEffect(() => {
    if (shouldLoadMore && hasMore && !loading && !loadingMore) {
      console.log('VirtualizedDishesGrid: Loading more dishes...');
      loadMore();
    }
  }, [shouldLoadMore, hasMore, loading, loadingMore, loadMore]);

  // Preload images for next batch
  useEffect(() => {
    if (dishes.length > 0) {
      const currentBatch = Math.floor(dishes.length / 20);
      
      if (!preloadedBatches.current.has(currentBatch)) {
        const imageUrls = dishes
          .slice(currentBatch * 20, (currentBatch + 1) * 20)
          .map(dish => dish.image_url)
          .filter(Boolean) as string[];
        
        if (imageUrls.length > 0) {
          preloadImages(imageUrls);
          preloadedBatches.current.add(currentBatch);
        }
      }
    }
  }, [dishes, preloadImages]);

  // Calculate the trigger point (50% through the list)
  const triggerIndex = Math.max(0, Math.floor(dishes.length * 0.5));

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error al cargar platos: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No se encontraron platos</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta cambiar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results counter */}
      <div className="text-sm text-muted-foreground">
        Mostrando {totalLoaded} platos
        {hasMore && <span> (cargando más automáticamente...)</span>}
      </div>

      {/* Dishes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {dishes.map((dish, index) => (
          <div
            key={dish.id}
            ref={index === triggerIndex ? lastElementRef : undefined}
          >
            <AllDishCard
              id={dish.id}
              name={dish.name}
              description={dish.description}
              basePrice={dish.base_price}
              imageUrl={dish.image_url}
              restaurantName={dish.restaurant_name}
              restaurantSlug={dish.restaurant_slug}
              restaurantId={dish.restaurant_id}
              distance={dish.distance_km}
              formattedPrice={dish.formatted_price}
            />
          </div>
        ))}

        {/* Loading more skeletons */}
        {loadingMore && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
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
      {!hasMore && dishes.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-16 h-px bg-border mx-auto mb-4" />
          <p>Has visto todos los platos disponibles</p>
          <p className="text-sm mt-1">Total: {totalLoaded} platos</p>
        </div>
      )}
    </div>
  );
}
