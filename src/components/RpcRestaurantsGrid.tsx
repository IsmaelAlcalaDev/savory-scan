
import { useEnhancedRpcFeed } from '@/hooks/useEnhancedRpcFeed';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import LazyRestaurantCard from './LazyRestaurantCard';
import { Skeleton } from './ui/skeleton';

interface RpcRestaurantsGridProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  minDietPercentages?: Record<string, number>;
  maxDistance?: number;
}

export default function RpcRestaurantsGrid(props: RpcRestaurantsGridProps) {
  const { userLocation } = useUserPreferences();
  
  const { restaurants, loading, error } = useEnhancedRpcFeed({
    searchQuery: props.searchQuery,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietTypes: props.selectedDietTypes,
    minDietPercentages: props.minDietPercentages,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron restaurantes</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} encontrado{restaurants.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <LazyRestaurantCard
            key={restaurant.id}
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
              description: restaurant.description,
              price_range: restaurant.price_range,
              google_rating: restaurant.rating,
              google_rating_count: restaurant.rating_count,
              distance_km: restaurant.distance_km,
              cuisine_types: restaurant.cuisine_types,
              establishment_type: restaurant.establishment_type,
              services: restaurant.services,
              favorites_count: restaurant.favorites_count,
              cover_image_url: restaurant.cover_image_url,
              logo_url: restaurant.logo_url,
            }}
          />
        ))}
      </div>
    </div>
  );
}
