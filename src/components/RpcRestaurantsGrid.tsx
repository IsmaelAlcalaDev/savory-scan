
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
            id={restaurant.id}
            name={restaurant.name}
            slug={restaurant.slug}
            description={restaurant.description}
            priceRange={restaurant.price_range}
            googleRating={restaurant.rating}
            googleRatingCount={restaurant.rating_count}
            distance={restaurant.distance_km}
            cuisineTypes={restaurant.cuisine_types}
            establishmentType={restaurant.establishment_type}
            services={restaurant.services}
            favoritesCount={restaurant.favorites_count}
            coverImageUrl={restaurant.cover_image_url}
            logoUrl={restaurant.logo_url}
          />
        ))}
      </div>
    </div>
  );
}
