
import { useState } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRestaurants } from '@/hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import RestaurantSortSelector from './RestaurantSortSelector';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface OptimizedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  maxDistance?: number;
  isOpenNow?: boolean;
}

export default function OptimizedRestaurantsTab({
  searchQuery,
  cuisineTypeIds,
  priceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  maxDistance,
  isOpenNow
}: OptimizedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>('recommended');

  const {
    restaurants,
    loading,
    error
  } = useRestaurants({
    searchQuery,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow
  });

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <RestaurantSortSelector
            value={sortBy}
            onChange={setSortBy}
            hasLocation={hasLocation}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <RestaurantSortSelector
            value={sortBy}
            onChange={setSortBy}
            hasLocation={hasLocation}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar restaurantes</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Restaurantes</h2>
          <RestaurantSortSelector
            value={sortBy}
            onChange={setSortBy}
            hasLocation={hasLocation}
          />
        </div>
        
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No hay restaurantes disponibles</h3>
          <p className="text-muted-foreground">
            Intenta ajustar tus filtros o buscar en una zona diferente.
          </p>
        </div>
      </div>
    );
  }

  // Sort restaurants based on sortBy prop
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    switch (sortBy) {
      case 'recommended':
        // First all premium restaurants by distance, then all free restaurants by favorites/rating
        const aPremium = a.subscription_plan === 'premium';
        const bPremium = b.subscription_plan === 'premium';
        
        if (aPremium && !bPremium) return -1;
        if (!aPremium && bPremium) return 1;
        
        // Both have same subscription level
        if (aPremium && bPremium) {
          // Both premium: sort by distance
          if (a.distance_km === null && b.distance_km === null) return 0;
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        } else {
          // Both free: sort by favorites count, then rating
          if (b.favorites_count !== a.favorites_count) {
            return (b.favorites_count || 0) - (a.favorites_count || 0);
          }
          return (b.google_rating || 0) - (a.google_rating || 0);
        }
        
      case 'distance':
      default:
        if (a.distance_km === null && b.distance_km === null) return 0;
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Restaurantes</h2>
        <RestaurantSortSelector
          value={sortBy}
          onChange={setSortBy}
          hasLocation={hasLocation}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRestaurants.map((restaurant) => (
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
    </div>
  );
}
