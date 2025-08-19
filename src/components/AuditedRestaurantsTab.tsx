
import { useState } from 'react';
import AuditedRestaurantsGrid from './AuditedRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface AuditedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  selectedDietCategories?: string[];
  maxDistance?: number;
  isOpenNow?: boolean;
}

export default function AuditedRestaurantsTab(props: AuditedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'favorites'>(
    userLocation ? 'distance' : 'favorites'
  );

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

      <AuditedRestaurantsGrid
        searchQuery={props.searchQuery}
        userLat={userLocation?.latitude}
        userLng={userLocation?.longitude}
        maxDistance={props.maxDistance}
        cuisineTypeIds={props.cuisineTypeIds}
        priceRanges={props.priceRanges}
        isHighRated={props.isHighRated}
        selectedEstablishmentTypes={props.selectedEstablishmentTypes}
        selectedDietTypes={props.selectedDietTypes}
        selectedDietCategories={props.selectedDietCategories}
        isOpenNow={props.isOpenNow}
        sortBy={sortBy}
      />
    </div>
  );
}
