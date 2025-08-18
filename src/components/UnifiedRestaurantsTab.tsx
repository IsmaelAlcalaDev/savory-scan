
import { useRestaurants } from '@/hooks/useRestaurants';
import { useRestaurantSort } from '@/hooks/useRestaurantSort';
import { Skeleton } from '@/components/ui/skeleton';
import FilterTags, { ResetFiltersButton } from './FilterTags';
import RestaurantCard from './RestaurantCard';
import type { Restaurant } from '@/types/restaurant';

interface UnifiedRestaurantsTabProps {
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
  selectedCuisines: number[];
  selectedPriceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onLoginRequired: () => void;
}

export default function UnifiedRestaurantsTab({
  searchQuery,
  userLocation,
  selectedCuisines,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow,
  isBudgetFriendly,
  hasActiveFilters,
  onClearAll,
  onLoginRequired
}: UnifiedRestaurantsTabProps) {
  const { sortOptions, selectedSort, handleSortChange } = useRestaurantSort(userLocation);

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 1000,
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    priceRanges: selectedPriceRanges.length > 0 ? selectedPriceRanges as ('€' | '€€' | '€€€' | '€€€€')[] : undefined,
    isHighRated,
    selectedEstablishmentTypes: selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : undefined,
    selectedDietTypes: selectedDietTypes.length > 0 ? selectedDietTypes : undefined,
    isOpenNow,
    isBudgetFriendly,
    sortBy: selectedSort
  });

  const getResultsText = (count: number, loading: boolean) => {
    if (loading) return 'Cargando...';
    
    if (selectedEstablishmentTypes.length === 1) {
      if (userLocation) {
        return `${count} establecimientos cerca de ti`;
      } else {
        return `${count} establecimientos en España`;
      }
    } else if (selectedEstablishmentTypes.length > 1) {
      if (userLocation) {
        return `${count} establecimientos cerca de ti`;
      } else {
        return `${count} establecimientos en España`;
      }
    } else {
      if (userLocation) {
        return `${count} restaurantes cerca de ti`;
      } else {
        return `${count} restaurantes en España`;
      }
    }
  };

  return (
    <>
      {/* Filter Tags with Sort */}
      <FilterTags 
        tags={[]}
        showSort={true}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between mb-3 mt-3">
        <div>
          <h2 className="text-sm font-medium mb-1 text-muted-foreground">
            {getResultsText(restaurants.length, restaurantsLoading)}
          </h2>
          {restaurantsError && <p className="text-sm text-destructive mt-1">Error: {restaurantsError}</p>}
        </div>
        <ResetFiltersButton 
          hasActiveFilters={hasActiveFilters} 
          onClearAll={onClearAll} 
        />
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {restaurantsLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : restaurantsError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Error al cargar restaurantes: {restaurantsError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Revisa la consola para más detalles
            </p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron restaurantes</p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          restaurants.map((restaurant: Restaurant) => (
            <RestaurantCard
              key={restaurant.id}
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
              onLoginRequired={onLoginRequired}
            />
          ))
        )}
      </div>
    </>
  );
}
