
import { useState } from 'react';
import UnifiedRestaurantsGrid from './UnifiedRestaurantsGrid';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRestaurantSort } from '@/hooks/useRestaurantSort';
import { useRestaurants } from '@/hooks/useRestaurants';

interface UnifiedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  maxDistance?: number;
  isOpenNow?: boolean;
  onSortChange?: (sortBy: string) => void;
}

export default function UnifiedRestaurantsTab(props: UnifiedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  
  // Obtener restaurantes primero
  const { restaurants, loading, error } = useRestaurants({
    searchQuery: props.searchQuery,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietTypes: props.selectedDietTypes,
    isOpenNow: props.isOpenNow
  });

  // Usar el hook de ordenamiento con los restaurantes
  const { sortedRestaurants, sortBy } = useRestaurantSort({ restaurants });

  // Notificar cambios de ordenamiento al padre
  const handleSortChange = (newSortBy: string) => {
    props.onSortChange?.(newSortBy);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Restaurantes</h2>
      </div>

      <UnifiedRestaurantsGrid
        restaurants={sortedRestaurants}
        loading={loading}
        error={error}
      />
    </div>
  );
}
