import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SortTag from './SortTag';
import { useRestaurantSort } from '@/hooks/useRestaurantSort';
import { useDishSort } from '@/hooks/useDishSort';

interface FilterTagsProps {
  cuisineTypes?: { id: number; name: string }[];
  establishmentTypes?: { id: number; name: string }[];
  dietTypes?: { id: number; name: string }[];
  dishDietTypes?: string[];
  priceRanges?: string[];
  foodTypes?: { id: number; name: string }[];
  customTags?: string[];
  spiceLevels?: number[];
  currentTab: 'restaurants' | 'dishes';
  restaurants?: any[];
  dishes?: any[];
  onSortChange?: (sortBy: string) => void;
}

const ResetFiltersButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleResetFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Delete all filter-related parameters
    newSearchParams.delete('cuisineTypes');
    newSearchParams.delete('establishmentTypes');
    newSearchParams.delete('dietTypes');
    newSearchParams.delete('dishDietTypes');
    newSearchParams.delete('priceRanges');
    newSearchParams.delete('foodTypes');
    newSearchParams.delete('customTags');
    newSearchParams.delete('spiceLevels');

    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <button
      onClick={handleResetFilters}
      className="inline-flex items-center rounded-full border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Borrar filtros
    </button>
  );
};

export default function FilterTags({
  cuisineTypes = [],
  establishmentTypes = [],
  dietTypes = [],
  dishDietTypes = [],
  priceRanges = [],
  foodTypes = [],
  customTags = [],
  spiceLevels = [],
  currentTab,
  restaurants = [],
  dishes = [],
  onSortChange
}: FilterTagsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const removeFilter = (filterType: string, filterValue: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    const filterValues = newSearchParams.getAll(filterType);
    const updatedFilterValues = filterValues.filter((value) => value !== filterValue);

    newSearchParams.delete(filterType); // Remove all instances of the filter
    updatedFilterValues.forEach((value) => newSearchParams.append(filterType, value)); // Re-add the ones that weren't removed

    router.push(`?${newSearchParams.toString()}`);
  };

  const hasActiveFilters =
    cuisineTypes.length > 0 ||
    establishmentTypes.length > 0 ||
    dietTypes.length > 0 ||
    dishDietTypes.length > 0 ||
    priceRanges.length > 0 ||
    foodTypes.length > 0 ||
    customTags.length > 0 ||
    spiceLevels.length > 0;

  // Sort hooks
  const restaurantSort = useRestaurantSort({ restaurants });
  const dishSort = useDishSort({ dishes });

  const handleSortChange = (sortValue: string) => {
    if (currentTab === 'restaurants') {
      restaurantSort.setSortBy(sortValue);
    } else {
      dishSort.setSortBy(sortValue);
    }
    onSortChange?.(sortValue);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {cuisineTypes.map((type) => (
        <Badge key={type.id} variant="secondary" className="gap-x-2">
          {type.name}
          <button onClick={() => removeFilter('cuisineTypes', String(type.id))}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {establishmentTypes.map((type) => (
        <Badge key={type.id} variant="secondary" className="gap-x-2">
          {type.name}
          <button onClick={() => removeFilter('establishmentTypes', String(type.id))}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {dietTypes.map((type) => (
        <Badge key={type.id} variant="secondary" className="gap-x-2">
          {type.name}
          <button onClick={() => removeFilter('dietTypes', String(type.id))}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {dishDietTypes.map((type) => (
        <Badge key={type} variant="secondary" className="gap-x-2">
          {type}
          <button onClick={() => removeFilter('dishDietTypes', type)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {priceRanges.map((range) => (
        <Badge key={range} variant="secondary" className="gap-x-2">
          {range}
          <button onClick={() => removeFilter('priceRanges', range)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {foodTypes.map((type) => (
        <Badge key={type.id} variant="secondary" className="gap-x-2">
          {type.name}
          <button onClick={() => removeFilter('foodTypes', String(type.id))}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {customTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-x-2">
          {tag}
          <button onClick={() => removeFilter('customTags', tag)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {spiceLevels.map((level) => (
        <Badge key={level} variant="secondary" className="gap-x-2">
          {level}
          <button onClick={() => removeFilter('spiceLevels', String(level))}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Sort Tag */}
      <SortTag
        options={currentTab === 'restaurants' ? restaurantSort.sortOptions : dishSort.sortOptions}
        currentValue={currentTab === 'restaurants' ? restaurantSort.sortBy : dishSort.sortBy}
        onSortChange={handleSortChange}
      />

      {hasActiveFilters && <ResetFiltersButton />}
    </div>
  );
}
