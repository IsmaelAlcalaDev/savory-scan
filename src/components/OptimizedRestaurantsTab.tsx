
import { useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRestaurantFeed } from '@/hooks/useRestaurantFeed';
import RestaurantCard from './RestaurantCard';
import RestaurantSortSelector from './RestaurantSortSelector';
import { Skeleton } from '@/components/ui/skeleton';
import SimpleDietFilter from './SimpleDietFilter';

interface OptimizedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[]; // Legacy prop for backward compatibility
  maxDistance?: number;
}

export default function OptimizedRestaurantsTab(props: OptimizedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'favorites'>(
    userLocation ? 'distance' : 'favorites'
  );
  const [selectedDietCategories, setSelectedDietCategories] = useState<string[]>([]);

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

  const { restaurants, loading, error } = useRestaurantFeed({
    searchQuery: props.searchQuery,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietCategories,
    sortBy
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <div className="flex gap-2">
            <SimpleDietFilter
              selectedDietCategories={selectedDietCategories}
              onDietCategoryChange={setSelectedDietCategories}
            />
            <RestaurantSortSelector
              value={sortBy}
              onChange={setSortBy}
              hasLocation={hasLocation}
            />
          </div>
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
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <div className="flex gap-2">
            <SimpleDietFilter
              selectedDietCategories={selectedDietCategories}
              onDietCategoryChange={setSelectedDietCategories}
            />
            <RestaurantSortSelector
              value={sortBy}
              onChange={setSortBy}
              hasLocation={hasLocation}
            />
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <div className="flex gap-2">
            <SimpleDietFilter
              selectedDietCategories={selectedDietCategories}
              onDietCategoryChange={setSelectedDietCategories}
            />
            <RestaurantSortSelector
              value={sortBy}
              onChange={setSortBy}
              hasLocation={hasLocation}
            />
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron restaurantes</p>
          <p className="text-sm text-muted-foreground mt-2">
            Intenta cambiar los filtros de búsqueda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Restaurantes</h2>
        <div className="flex gap-2">
          <SimpleDietFilter
            selectedDietCategories={selectedDietCategories}
            onDietCategoryChange={setSelectedDietCategories}
          />
          <RestaurantSortSelector
            value={sortBy}
            onChange={setSortBy}
            hasLocation={hasLocation}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant, index) => (
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
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  );
}
