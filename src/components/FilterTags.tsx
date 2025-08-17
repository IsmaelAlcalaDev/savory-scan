
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import SimpleDietFilterWithCounts from './SimpleDietFilterWithCounts';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes?: number[];
  selectedDietCategories?: string[];
  selectedCustomTags?: string[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'customTags' | 'openNow' | 'budgetFriendly' | 'all', id?: number) => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange?: (types: number[]) => void;
  onDietCategoryChange?: (categories: string[]) => void;
  onCustomTagsChange?: (tags: string[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
  // New props for diet filter counts
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  minRating?: number;
}

export default function FilterTags({
  activeTab,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietCategories = [],
  selectedCustomTags = [],
  isOpenNow,
  isBudgetFriendly,
  onClearFilter,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietCategoryChange = () => {},
  onCustomTagsChange = () => {},
  onOpenNowChange,
  onBudgetFriendlyChange,
  searchQuery,
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  priceRanges,
  minRating
}: FilterTagsProps) {
  const { cuisineTypes } = useCuisineTypes();
  const { foodTypes } = useFoodTypes();
  const { establishmentTypes } = useEstablishmentTypes();

  const priceRangeLabels = {
    '€': 'Económico',
    '€€': 'Moderado', 
    '€€€': 'Caro',
    '€€€€': 'Muy caro'
  };

  const quickFilters = [
    {
      key: 'highRated',
      label: 'Alta calificación',
      active: isHighRated,
      onClick: () => onHighRatedChange(!isHighRated),
      emoji: '⭐'
    },
    {
      key: 'openNow',
      label: 'Abierto ahora',
      active: isOpenNow,
      onClick: () => onOpenNowChange(!isOpenNow),
      emoji: '🕐'
    },
    {
      key: 'budgetFriendly',
      label: 'Económico',
      active: isBudgetFriendly,
      onClick: () => onBudgetFriendlyChange(!isBudgetFriendly),
      emoji: '💰'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Quick Filters - Always visible */}
      <div className="flex gap-2 flex-wrap">
        {quickFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant={filter.active ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={filter.onClick}
          >
            <span className="mr-1">{filter.emoji}</span>
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Diet Filters - Use SimpleDietFilterWithCounts directly */}
      <div>
        <SimpleDietFilterWithCounts
          selectedDietCategories={selectedDietCategories}
          onDietCategoryChange={onDietCategoryChange}
          searchQuery={searchQuery}
          userLat={userLat}
          userLng={userLng}
          maxDistance={maxDistance}
          cuisineTypeIds={cuisineTypeIds || selectedCuisines}
          priceRanges={priceRanges || selectedPriceRanges}
          selectedEstablishmentTypes={selectedEstablishmentTypes}
          minRating={minRating}
        />
      </div>

      {/* Active Filter Tags */}
      <div className="flex gap-2 flex-wrap">
        {/* Cuisine tags */}
        {selectedCuisines.map(cuisineId => {
          const cuisine = cuisineTypes?.find(c => c.id === cuisineId);
          return cuisine ? (
            <Badge key={`cuisine-${cuisineId}`} variant="secondary" className="gap-1">
              {cuisine.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onClearFilter('cuisine', cuisineId)}
              />
            </Badge>
          ) : null;
        })}

        {/* Food type tags (for dishes tab) */}
        {activeTab === 'dishes' && selectedFoodTypes.map(foodTypeId => {
          const foodType = foodTypes?.find(ft => ft.id === foodTypeId);
          return foodType ? (
            <Badge key={`foodType-${foodTypeId}`} variant="secondary" className="gap-1">
              {foodType.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onClearFilter('foodType', foodTypeId)}
              />
            </Badge>
          ) : null;
        })}

        {/* Price range tags */}
        {selectedPriceRanges.map(range => (
          <Badge key={`price-${range}`} variant="secondary" className="gap-1">
            {priceRangeLabels[range as keyof typeof priceRangeLabels] || range}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => {
                const newRanges = selectedPriceRanges.filter(r => r !== range);
                onPriceRangeChange(newRanges);
              }}
            />
          </Badge>
        ))}

        {/* Establishment type tags */}
        {selectedEstablishmentTypes.map(typeId => {
          const estType = establishmentTypes?.find(et => et.id === typeId);
          return estType ? (
            <Badge key={`establishment-${typeId}`} variant="secondary" className="gap-1">
              {estType.name}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onClearFilter('establishment', typeId)}
              />
            </Badge>
          ) : null;
        })}

        {/* Custom tags (for dishes) */}
        {activeTab === 'dishes' && selectedCustomTags.map(tag => (
          <Badge key={`custom-${tag}`} variant="secondary" className="gap-1">
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => {
                const newTags = selectedCustomTags.filter(t => t !== tag);
                onCustomTagsChange(newTags);
              }}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ResetFiltersButton({ 
  hasActiveFilters, 
  onClearAll 
}: { 
  hasActiveFilters: boolean; 
  onClearAll: () => void;
}) {
  if (!hasActiveFilters) return null;

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClearAll}
      className="text-muted-foreground hover:text-foreground"
    >
      Limpiar filtros
    </Button>
  );
}
