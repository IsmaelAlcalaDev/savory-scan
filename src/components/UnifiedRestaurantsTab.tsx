
import { useState } from 'react';
import InfiniteRestaurantsGrid from './InfiniteRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';
import FilterTags, { ResetFiltersButton } from './FilterTags';
import { useUserPreferences } from '@/hooks/useUserPreferences';

interface UnifiedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
}

export default function UnifiedRestaurantsTab(props: UnifiedRestaurantsTabProps) {
  const { userLocation } = useUserPreferences();
  const [sortBy, setSortBy] = useState<'recommended' | 'distance'>('recommended');

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

  console.log('UnifiedRestaurantsTab: sortBy state =', sortBy, 'hasLocation =', hasLocation);

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    (props.cuisineTypeIds && props.cuisineTypeIds.length > 0) ||
    (props.priceRanges && props.priceRanges.length > 0) ||
    props.isHighRated ||
    (props.selectedEstablishmentTypes && props.selectedEstablishmentTypes.length > 0) ||
    (props.selectedDietTypes && props.selectedDietTypes.length > 0) ||
    props.isOpenNow
  );

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

      <InfiniteRestaurantsGrid
        searchQuery={props.searchQuery}
        userLat={userLocation?.latitude}
        userLng={userLocation?.longitude}
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
