
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickFilterTags from './QuickFilterTags';
import UnifiedFiltersModal from './UnifiedFiltersModal';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  selectedCustomTags?: string[];
  selectedSpiceLevels?: number[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'customTags' | 'spiceLevels' | 'openNow' | 'budgetFriendly' | 'all', id?: number) => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onCustomTagsChange?: (tags: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
}

const spiceLevelNames = {
  1: 'Poco picante',
  2: 'Picante', 
  3: 'Muy picante'
};

export default function FilterTags({
  activeTab,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  selectedCustomTags = [],
  selectedSpiceLevels = [],
  isOpenNow,
  isBudgetFriendly,
  onClearFilter,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onCustomTagsChange = () => {},
  onSpiceLevelChange = () => {},
  onOpenNowChange,
  onBudgetFriendlyChange
}: FilterTagsProps) {
  
  const hasCuisineFilters = selectedCuisines.length > 0;
  const hasFoodTypeFilters = selectedFoodTypes.length > 0;
  const hasPriceRangeFilters = selectedPriceRanges.length > 0;
  const hasEstablishmentTypeFilters = selectedEstablishmentTypes.length > 0;
  const hasDietTypeFilters = selectedDietTypes.length > 0;
  const hasCustomTagsFilters = selectedCustomTags.length > 0;
  const hasSpiceLevelFilters = selectedSpiceLevels.length > 0;

  return (
    <div className="space-y-3">
      {/* Quick Action Tags */}
      <QuickFilterTags
        activeTab={activeTab}
        selectedPriceRanges={selectedPriceRanges}
        isHighRated={isHighRated}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        selectedDietTypes={selectedDietTypes}
        selectedSpiceLevels={selectedSpiceLevels}
        isOpenNow={isOpenNow}
        isBudgetFriendly={isBudgetFriendly}
        onPriceRangeChange={onPriceRangeChange}
        onHighRatedChange={onHighRatedChange}
        onEstablishmentTypeChange={onEstablishmentTypeChange}
        onDietTypeChange={onDietTypeChange}
        onSpiceLevelChange={onSpiceLevelChange}
        onOpenNowChange={onOpenNowChange}
        onBudgetFriendlyChange={onBudgetFriendlyChange}
      />

      {/* Active Filters */}
      {(selectedCuisines.length > 0 || 
        selectedFoodTypes.length > 0 || 
        selectedCustomTags.length > 0 ||
        selectedSpiceLevels.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {/* Cuisine Filters */}
          {selectedCuisines.map((cuisineId) => (
            <Badge
              key={cuisineId}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              Cuisine {cuisineId} {/* Replace with actual cuisine name */}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onClearFilter('cuisine', cuisineId)}
              />
            </Badge>
          ))}

          {/* Food Type Filters */}
          {selectedFoodTypes.map((foodTypeId) => (
            <Badge
              key={foodTypeId}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              Food Type {foodTypeId} {/* Replace with actual food type name */}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onClearFilter('foodType', foodTypeId)}
              />
            </Badge>
          ))}

          {/* Custom Tags */}
          {selectedCustomTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  const newTags = selectedCustomTags.filter(t => t !== tag);
                  onCustomTagsChange(newTags);
                }}
              />
            </Badge>
          ))}

          {/* Spice Levels */}
          {selectedSpiceLevels.map((level) => (
            <Badge
              key={level}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              {spiceLevelNames[level as keyof typeof spiceLevelNames]}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  const newLevels = selectedSpiceLevels.filter(l => l !== level);
                  onSpiceLevelChange(newLevels);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface ResetFiltersButtonProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ResetFiltersButton({
  hasActiveFilters,
  onClearAll
}: ResetFiltersButtonProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button variant="link" size="sm" onClick={onClearAll}>
      Limpiar todo
    </Button>
  );
}
