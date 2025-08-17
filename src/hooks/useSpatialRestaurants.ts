
import { useState, useEffect } from 'react';
import { SpatialService, type SpatialRestaurant } from '@/services/spatialService';

interface UseSpatialRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  enabled?: boolean;
}

export const useSpatialRestaurants = (props: UseSpatialRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<SpatialRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    isHighRated = false,
    selectedEstablishmentTypes,
    selectedDietTypes,
    enabled = true
  } = props;

  useEffect(() => {
    const fetchSpatialRestaurants = async () => {
      // Solo buscar si tenemos coordenadas del usuario y está habilitado
      if (!enabled || !userLat || !userLng) {
        setRestaurants([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('useSpatialRestaurants: Fetching with PostGIS');

        const results = await SpatialService.findNearbyRestaurants(
          userLat,
          userLng,
          maxDistance,
          50,
          {
            searchQuery,
            cuisineTypeIds,
            priceRanges,
            isHighRated,
            selectedEstablishmentTypes,
            selectedDietTypes
          }
        );

        setRestaurants(results);
        console.log('useSpatialRestaurants: Found', results.length, 'restaurants with PostGIS');

      } catch (err) {
        console.error('useSpatialRestaurants: Error:', err);
        setError(err instanceof Error ? err.message : 'Error al buscar restaurantes cercanos');
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpatialRestaurants();
  }, [
    enabled,
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    JSON.stringify(cuisineTypeIds),
    JSON.stringify(priceRanges),
    isHighRated,
    JSON.stringify(selectedEstablishmentTypes),
    JSON.stringify(selectedDietTypes)
  ]);

  return { restaurants, loading, error };
};
