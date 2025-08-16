
import { useRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RestaurantsGridProps {
  searchQuery?: string;
  userLat?: number | null;
  userLng?: number | null;
  selectedCuisines?: number[];
  selectedFoodTypes?: number[];
  selectedPriceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  isOpenNow?: boolean;
  isHighRated?: boolean;
  isBudgetFriendly?: boolean;
  isLoadingLocation?: boolean;
  isGeolocationAvailable?: boolean;
  isGeolocationEnabled?: boolean;
}

export default function RestaurantsGrid({
  searchQuery,
  userLat,
  userLng,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  selectedEstablishmentTypes,
  isOpenNow,
  isHighRated,
  isBudgetFriendly,
  isLoadingLocation,
  isGeolocationAvailable,
  isGeolocationEnabled
}: RestaurantsGridProps) {
  const { restaurants, loading, error } = useRestaurants({
    searchQuery,
    userLat,
    userLng,
    selectedCuisines,
    selectedFoodTypes,
    selectedPriceRanges,
    selectedEstablishmentTypes,
    isOpenNow,
    isHighRated,
    isBudgetFriendly
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-md" />
            <div className="space-y-2">
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
      <div className="text-red-500">Error: {error}</div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-gray-500">No se encontraron restaurantes con los filtros seleccionados.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
