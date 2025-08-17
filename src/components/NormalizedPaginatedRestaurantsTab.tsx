
import { useState } from 'react';
import PaginatedRestaurantsGrid from './PaginatedRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNormalizedParams } from '@/hooks/useNormalizedParams';
import { useNormalizedRestaurantFeed } from '@/hooks/useNormalizedRestaurantFeed';

interface NormalizedPaginatedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: string[]; // Changed from number[] to string[]
  maxDistance?: number;
}

export default function NormalizedPaginatedRestaurantsTab(props: NormalizedPaginatedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'favorites'>(
    userLocation ? 'distance' : 'favorites'
  );

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

  // Use normalized parameters and URL synchronization
  const { normalizedParams, canonicalUrl } = useNormalizedParams({
    searchQuery: props.searchQuery,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietCategories: props.selectedDietTypes, // Now correctly matches string[] type
    isOpenNow: false
  });

  // Use normalized restaurant feed
  const { restaurants, loading, error, cacheKey } = useNormalizedRestaurantFeed({
    ...normalizedParams,
    sortBy
  });

  console.log('NormalizedPaginatedRestaurantsTab: Using cache key:', cacheKey);
  console.log('NormalizedPaginatedRestaurantsTab: Canonical URL:', canonicalUrl);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <div className="text-xs text-muted-foreground mt-1">
            Cache: {cacheKey}
          </div>
        </div>
        <RestaurantSortSelector
          value={sortBy}
          onChange={setSortBy}
          hasLocation={hasLocation}
        />
      </div>

      {/* Display restaurants using existing grid component */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-48 w-full rounded-lg bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron restaurantes</p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {restaurant.cover_image_url && (
                  <img 
                    src={restaurant.cover_image_url} 
                    alt={restaurant.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
                  {restaurant.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{restaurant.price_range}</span>
                    {restaurant.google_rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm">{restaurant.google_rating}</span>
                        {restaurant.google_rating_count && (
                          <span className="text-xs text-muted-foreground">
                            ({restaurant.google_rating_count})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {restaurant.distance_km && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {restaurant.distance_km.toFixed(1)} km
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add canonical URL meta tag */}
      <link rel="canonical" href={canonicalUrl} />
    </div>
  );
}
