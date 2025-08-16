
import { Badge } from '@/components/ui/badge';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useCustomTags } from '@/hooks/useCustomTags';
import PriceFilter from './PriceFilter';
import UnifiedFiltersModal from './UnifiedFiltersModal';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  selectedDishDietTypes?: string[];
  selectedSpiceLevels?: number[];
  selectedCustomTags?: string[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'dishDiet' | 'spice' | 'customTags' | 'openNow' | 'budgetFriendly' | 'all') => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onDishDietTypeChange?: (types: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  onCustomTagsChange?: (tags: string[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
}

export default function FilterTags({
  activeTab,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  selectedDishDietTypes = [],
  selectedSpiceLevels = [],
  selectedCustomTags = [],
  isOpenNow,
  isBudgetFriendly,
  onClearFilter,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onDishDietTypeChange = () => {},
  onSpiceLevelChange = () => {},
  onCustomTagsChange = () => {},
  onOpenNowChange,
  onBudgetFriendlyChange
}: FilterTagsProps) {
  const { data: cuisineTypes = [] } = useCuisineTypes();
  const { data: foodTypes = [] } = useFoodTypes();
  const { data: establishmentTypes = [] } = useEstablishmentTypes();
  const { data: dietTypes = [] } = useDietTypes();
  const { data: customTags = [] } = useCustomTags();

  // Map diet type names for dishes
  const dishDietTypeNames: { [key: string]: string } = {
    vegetarian: 'Vegetariano',
    vegan: 'Vegano',
    gluten_free: 'Sin Gluten',
    healthy: 'Saludable'
  };

  // Map spice level names
  const spiceLevelNames: { [key: number]: string } = {
    1: 'Poco picante',
    2: 'Picante',
    3: 'Muy picante'
  };

  return (
    <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-hide">
      {/* Quick Filter Tags */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <PriceFilter
          selectedPriceRanges={selectedPriceRanges}
          onPriceRangeChange={onPriceRangeChange}
        />
        
        {isHighRated && (
          <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            Bien valorado
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('highRated')}
            />
          </Badge>
        )}
        
        {isOpenNow && (
          <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            Abierto ahora
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('openNow')}
            />
          </Badge>
        )}
        
        {isBudgetFriendly && (
          <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            Económico
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('budgetFriendly')}
            />
          </Badge>
        )}
      </div>

      {/* Active Filter Tags */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Cuisine Types */}
        {selectedCuisines.map(cuisineId => {
          const cuisine = cuisineTypes.find(c => c.id === cuisineId);
          return cuisine ? (
            <Badge key={`cuisine-${cuisineId}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {cuisine.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => onClearFilter('cuisine')}
              />
            </Badge>
          ) : null;
        })}

        {/* Food Types */}
        {selectedFoodTypes.map(foodTypeId => {
          const foodType = foodTypes.find(f => f.id === foodTypeId);
          return foodType ? (
            <Badge key={`food-${foodTypeId}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {foodType.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => onClearFilter('foodType')}
              />
            </Badge>
          ) : null;
        })}

        {/* Establishment Types */}
        {selectedEstablishmentTypes.map(estTypeId => {
          const estType = establishmentTypes.find(e => e.id === estTypeId);
          return estType ? (
            <Badge key={`est-${estTypeId}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {estType.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => onClearFilter('establishment')}
              />
            </Badge>
          ) : null;
        })}

        {/* Diet Types for Restaurants */}
        {activeTab === 'restaurants' && selectedDietTypes.map(dietTypeId => {
          const dietType = dietTypes.find(d => d.id === dietTypeId);
          return dietType ? (
            <Badge key={`diet-${dietTypeId}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
              {dietType.name}
              <X 
                className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
                onClick={() => onClearFilter('diet')}
              />
            </Badge>
          ) : null;
        })}

        {/* Dish Diet Types */}
        {activeTab === 'dishes' && selectedDishDietTypes.map(dishDietType => (
          <Badge key={`dish-diet-${dishDietType}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            {dishDietTypeNames[dishDietType] || dishDietType}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('dishDiet')}
            />
          </Badge>
        ))}

        {/* Spice Levels */}
        {activeTab === 'dishes' && selectedSpiceLevels.map(spiceLevel => (
          <Badge key={`spice-${spiceLevel}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            {spiceLevelNames[spiceLevel] || `Nivel ${spiceLevel}`}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('spice')}
            />
          </Badge>
        ))}

        {/* Custom Tags */}
        {selectedCustomTags.map(tag => (
          <Badge key={`tag-${tag}`} variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
            {tag}
            <X 
              className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full" 
              onClick={() => onClearFilter('customTags')}
            />
          </Badge>
        ))}
      </div>

      {/* Unified Filters Modal */}
      <div className="flex-shrink-0">
        <UnifiedFiltersModal
          activeTab={activeTab}
          selectedAllergens={[]} // Not used in this context
          selectedDietTypes={selectedDietTypes}
          selectedDishDietTypes={selectedDishDietTypes}
          selectedSpiceLevels={selectedSpiceLevels}
          onAllergenChange={() => {}} // Not used in this context
          onDietTypeChange={onDietTypeChange}
          onDishDietTypeChange={onDishDietTypeChange}
          onSpiceLevelChange={onSpiceLevelChange}
        />
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
      className="text-muted-foreground hover:text-foreground flex items-center gap-1"
    >
      <RotateCcw className="h-4 w-4" />
      Limpiar
    </Button>
  );
}
