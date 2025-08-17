
import { useState } from 'react';
import PaginatedRestaurantsGrid from './PaginatedRestaurantsGrid';
import RestaurantSortSelector from './RestaurantSortSelector';

interface PaginatedRestaurantsTabProps {
  searchQuery?: string;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  maxDistance?: number;
  userLat?: number;
  userLng?: number;
}

export default function PaginatedRestaurantsTab(props: PaginatedRestaurantsTabProps) {
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'favorites'>(
    (props.userLat && props.userLng) ? 'distance' : 'favorites'
  );

  const hasLocation = Boolean(props.userLat && props.userLng);

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

      <PaginatedRestaurantsGrid
        searchQuery={props.searchQuery}
        userLat={props.userLat}
        userLng={props.userLng}
        maxDistance={props.maxDistance}
        cuisineTypeIds={props.cuisineTypeIds}
        priceRanges={props.priceRanges}
        isHighRated={props.isHighRated}
        selectedEstablishmentTypes={props.selectedEstablishmentTypes}
        selectedDietTypes={props.selectedDietTypes}
        sortBy={sortBy}
      />
    </div>
  );
}
