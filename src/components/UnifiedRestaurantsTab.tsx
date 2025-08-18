
import { useState } from 'react';
import UnifiedRestaurantsGrid from './UnifiedRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UnifiedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  maxDistance?: number;
  isOpenNow?: boolean;
}

export default function UnifiedRestaurantsTab(props: UnifiedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>('recommended');

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

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

      <UnifiedRestaurantsGrid
        searchQuery={props.searchQuery}
        userLat={userLocation?.latitude}
        userLng={userLocation?.longitude}
        maxDistance={props.maxDistance}
        cuisineTypeIds={props.cuisineTypeIds}
        priceRanges={props.priceRanges}
        isHighRated={props.isHighRated}
        selectedEstablishmentTypes={props.selectedEstablishmentTypes}
        selectedDietTypes={props.selectedDietTypes}
        isOpenNow={props.isOpenNow}
        sortBy={sortBy}
      />
    </div>
  );
}
