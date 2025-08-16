
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceFilter from './PriceFilter';
import DietFilter from './DietFilter';
import DishDietFilter from './DishDietFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import CustomTagsFilter from './CustomTagsFilter';

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
  selectedCustomTags: string[];
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  isMostPopular?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'dishDiet' | 'spice' | 'customTags' | 'openNow' | 'budgetFriendly' | 'mostPopular' | 'all', id?: number) => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onDishDietTypeChange?: (types: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
  onCustomTagsChange: (tags: string[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
  onMostPopularChange?: (value: boolean) => void;
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
  selectedCustomTags,
  isOpenNow,
  isBudgetFriendly,
  isMostPopular = false,
  onClearFilter,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onDishDietTypeChange,
  onSpiceLevelChange,
  onCustomTagsChange,
  onOpenNowChange,
  onBudgetFriendlyChange,
  onMostPopularChange
}: FilterTagsProps) {
  
  const hasActiveFilters: boolean = selectedCuisines.length > 0 || 
  selectedFoodTypes.length > 0 || 
  selectedPriceRanges.length > 0 || 
  isHighRated || 
  selectedEstablishmentTypes.length > 0 || 
  selectedDietTypes.length > 0 || 
  selectedDishDietTypes.length > 0 ||
  selectedSpiceLevels.length > 0 ||
  selectedCustomTags.length > 0 ||
  isOpenNow ||
  isBudgetFriendly ||
  isMostPopular;

  return (
    <div className="space-y-3">
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={isBudgetFriendly ? "default" : "outline"}
          size="sm"
          onClick={() => onBudgetFriendlyChange(!isBudgetFriendly)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            isBudgetFriendly 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          )}
        >
          💰 Económico
        </Button>
        
        <Button
          variant={isHighRated ? "default" : "outline"}
          size="sm"
          onClick={() => onHighRatedChange(!isHighRated)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            isHighRated 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          )}
        >
          ⭐ Mejor valorados
        </Button>

        {activeTab === 'dishes' && onMostPopularChange && (
          <Button
            variant={isMostPopular ? "default" : "outline"}
            size="sm"
            onClick={() => onMostPopularChange(!isMostPopular)}
            className={cn(
              "h-8 px-3 text-xs font-medium transition-all duration-200",
              isMostPopular 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
            )}
          >
            🔥 Más Popular
          </Button>
        )}
        
        <Button
          variant={isOpenNow ? "default" : "outline"}
          size="sm"
          onClick={() => onOpenNowChange(!isOpenNow)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all duration-200",
            isOpenNow 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
          )}
        >
          🕐 Abierto ahora
        </Button>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTab === 'restaurants' && (
          <>
            <PriceFilter
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={onPriceRangeChange}
            />
            <EstablishmentTypeFilter
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              onEstablishmentTypeChange={onEstablishmentTypeChange}
            />
            <DietFilter
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={onDietTypeChange}
            />
          </>
        )}

        {activeTab === 'dishes' && (
          <>
            <DishDietFilter
              selectedDishDietTypes={selectedDishDietTypes}
              selectedSpiceLevels={selectedSpiceLevels}
              onDishDietTypeChange={onDishDietTypeChange}
              onSpiceLevelChange={onSpiceLevelChange}
            />
             <CustomTagsFilter
              selectedCustomTags={selectedCustomTags}
              onCustomTagsChange={onCustomTagsChange}
            />
          </>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCuisines.length > 0 &&
            selectedCuisines.map((cuisineId) => (
              <Badge key={cuisineId} variant="secondary" className="flex items-center gap-1">
                Cocina {cuisineId}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('cuisine', cuisineId)}
                />
              </Badge>
            ))}

          {selectedFoodTypes.length > 0 &&
            selectedFoodTypes.map((foodTypeId) => (
              <Badge key={foodTypeId} variant="secondary" className="flex items-center gap-1">
                Comida {foodTypeId}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('foodType', foodTypeId)}
                />
              </Badge>
            ))}

          {selectedPriceRanges.length > 0 &&
            selectedPriceRanges.map((range) => (
              <Badge key={range} variant="secondary" className="flex items-center gap-1">
                Precio {range}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('price')}
                />
              </Badge>
            ))}

          {isHighRated && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ⭐ Mejor valorados
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onClearFilter('highRated')}
              />
            </Badge>
          )}

          {selectedEstablishmentTypes.length > 0 &&
            selectedEstablishmentTypes.map((typeId) => (
              <Badge key={typeId} variant="secondary" className="flex items-center gap-1">
                Establecimiento {typeId}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('establishment', typeId)}
                />
              </Badge>
            ))}

          {selectedDietTypes.length > 0 &&
            selectedDietTypes.map((dietId) => (
              <Badge key={dietId} variant="secondary" className="flex items-center gap-1">
                Dieta {dietId}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('diet', dietId)}
                />
              </Badge>
            ))}
          
          {selectedDishDietTypes.length > 0 &&
            selectedDishDietTypes.map((dietType) => (
              <Badge key={dietType} variant="secondary" className="flex items-center gap-1">
                Dieta {dietType}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => onClearFilter('dishDiet')}
                />
              </Badge>
            ))}

            {selectedSpiceLevels.length > 0 &&
              selectedSpiceLevels.map((level) => (
                <Badge key={level} variant="secondary" className="flex items-center gap-1">
                  Nivel de picante {level}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => onClearFilter('spice')}
                  />
                </Badge>
              ))}

            {selectedCustomTags.length > 0 &&
              selectedCustomTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  Tag: {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => onClearFilter('customTags')}
                  />
                </Badge>
              ))}
          
          {isMostPopular && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🔥 Más Popular
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onClearFilter('mostPopular')}
              />
            </Badge>
          )}

          {isOpenNow && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Abierto ahora
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onClearFilter('openNow')}
              />
            </Badge>
          )}

          {isBudgetFriendly && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Económico
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => onClearFilter('budgetFriendly')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface ResetFiltersButtonProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function ResetFiltersButton({ hasActiveFilters, onClearAll }: ResetFiltersButtonProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClearAll}
      className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      Borrar filtros
    </Button>
  );
}
