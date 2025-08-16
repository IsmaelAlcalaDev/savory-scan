
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriceFilter from './PriceFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import DietFilter from './DietFilter';
import CustomTagsFilter from './CustomTagsFilter';
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
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'customTags' | 'openNow' | 'budgetFriendly' | 'all', id?: number) => void;
  onPriceRangeChange: (ranges: string[]) => void;
  onHighRatedChange: (value: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onCustomTagsChange?: (tags: string[]) => void;
  onOpenNowChange: (value: boolean) => void;
  onBudgetFriendlyChange: (value: boolean) => void;
}

export function ResetFiltersButton({ hasActiveFilters, onClearAll }: { hasActiveFilters: boolean; onClearAll: () => void }) {
  if (!hasActiveFilters) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClearAll}
      className="text-muted-foreground hover:text-foreground text-xs"
    >
      Limpiar todo
    </Button>
  );
}

export default function FilterTags({
  activeTab,
  selectedCuisines,
  selectedFoodTypes,
  selectedPriceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  selectedCustomTags = [],
  isOpenNow,
  isBudgetFriendly,
  onClearFilter,
  onPriceRangeChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onCustomTagsChange = () => {},
  onOpenNowChange,
  onBudgetFriendlyChange
}: FilterTagsProps) {
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Calculate active filters count for debugging
  const activeFiltersCount = selectedCuisines.length + 
    selectedFoodTypes.length + 
    selectedPriceRanges.length + 
    (isHighRated ? 1 : 0) + 
    selectedEstablishmentTypes.length + 
    selectedDietTypes.length + 
    selectedCustomTags.length +
    (isOpenNow ? 1 : 0) +
    (isBudgetFriendly ? 1 : 0);

  console.log('FilterTags: Active filters breakdown:', {
    cuisines: selectedCuisines.length,
    foodTypes: selectedFoodTypes.length,
    priceRanges: selectedPriceRanges.length,
    highRated: isHighRated ? 1 : 0,
    establishmentTypes: selectedEstablishmentTypes.length,
    dietTypes: selectedDietTypes.length,
    customTags: selectedCustomTags.length,
    openNow: isOpenNow ? 1 : 0,
    budgetFriendly: isBudgetFriendly ? 1 : 0,
    total: activeFiltersCount
  });

  const renderQuickFilters = () => (
    <div className="flex flex-wrap gap-2">
      {/* Budget Friendly - Always first */}
      {!isBudgetFriendly && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBudgetFriendlyChange(true)}
          className="text-xs h-7"
        >
          💰 Económico
        </Button>
      )}
      
      {/* High Rated */}
      {!isHighRated && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onHighRatedChange(true)}
          className="text-xs h-7"
        >
          ⭐ Muy valorado
        </Button>
      )}
      
      {/* Open Now */}
      {!isOpenNow && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenNowChange(true)}
          className="text-xs h-7"
        >
          🕒 Abierto ahora
        </Button>
      )}
    </div>
  );

  const renderActiveFilters = () => {
    const filters = [];

    // Budget Friendly Filter
    if (isBudgetFriendly) {
      filters.push(
        <Badge key="budget-friendly" variant="secondary" className="text-xs">
          💰 Económico
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('budgetFriendly')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    // High Rated Filter
    if (isHighRated) {
      filters.push(
        <Badge key="high-rated" variant="secondary" className="text-xs">
          ⭐ Muy valorado
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('highRated')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    // Open Now Filter
    if (isOpenNow) {
      filters.push(
        <Badge key="open-now" variant="secondary" className="text-xs">
          🕒 Abierto ahora
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('openNow')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    // Price Range Filters
    selectedPriceRanges.forEach((range) => {
      filters.push(
        <Badge key={`price-${range}`} variant="secondary" className="text-xs">
          {range}
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onPriceRangeChange(selectedPriceRanges.filter(r => r !== range))}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    });

    // Establishment Type Filters (for restaurants tab)
    if (activeTab === 'restaurants' && selectedEstablishmentTypes.length > 0) {
      filters.push(
        <Badge key="establishment-types" variant="secondary" className="text-xs">
          {selectedEstablishmentTypes.length} tipo{selectedEstablishmentTypes.length !== 1 ? 's' : ''} de comercio
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('establishment')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    // Diet Type Filters
    if (selectedDietTypes.length > 0) {
      const dietLabel = activeTab === 'restaurants' ? 'dieta' : 'dieta';
      filters.push(
        <Badge key="diet-types" variant="secondary" className="text-xs">
          {selectedDietTypes.length} tipo{selectedDietTypes.length !== 1 ? 's' : ''} de {dietLabel}
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('diet')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    // Custom Tags Filters (for dishes tab)
    if (activeTab === 'dishes' && selectedCustomTags.length > 0) {
      filters.push(
        <Badge key="custom-tags" variant="secondary" className="text-xs">
          {selectedCustomTags.length} etiqueta{selectedCustomTags.length !== 1 ? 's' : ''}
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-auto p-0 hover:bg-transparent"
            onClick={() => onClearFilter('customTags')}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      );
    }

    return filters;
  };

  const activeFilters = renderActiveFilters();
  const hasActiveQuickFilters = isBudgetFriendly || isHighRated || isOpenNow;

  return (
    <div className="space-y-3">
      {/* Quick Action Filters - Show when no active quick filters */}
      {!hasActiveQuickFilters && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {renderQuickFilters()}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters}
        </div>
      )}

      {/* Advanced Filters - Always show the modal trigger */}
      <div className="flex items-center gap-2">
        <UnifiedFiltersModal
          activeTab={activeTab}
          selectedAllergens={[]} // Not used in this context
          selectedDietTypes={selectedDietTypes}
          selectedDishDietTypes={[]} // For dishes, handled separately
          selectedSpiceLevels={[]} // For dishes, handled separately
          onAllergenChange={() => {}} // Not used in this context
          onDietTypeChange={onDietTypeChange}
          onDishDietTypeChange={() => {}} // For dishes, handled separately
          onSpiceLevelChange={() => {}} // For dishes, handled separately
        />

        {/* Additional filter sections for more complex filters */}
        {showAllFilters && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l shadow-lg">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filtros avanzados</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Rango de precios</h4>
                    <PriceFilter
                      selectedPriceRanges={selectedPriceRanges}
                      onPriceRangeChange={onPriceRangeChange}
                    />
                  </div>

                  {activeTab === 'restaurants' && (
                    <div>
                      <h4 className="font-medium mb-3">Tipo de establecimiento</h4>
                      <EstablishmentTypeFilter
                        selectedEstablishmentTypes={selectedEstablishmentTypes}
                        onEstablishmentTypeChange={onEstablishmentTypeChange}
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-3">Tipo de dieta</h4>
                    <DietFilter
                      selectedDietTypes={selectedDietTypes}
                      onDietTypeChange={onDietTypeChange}
                    />
                  </div>

                  {activeTab === 'dishes' && (
                    <div>
                      <h4 className="font-medium mb-3">Etiquetas personalizadas</h4>
                      <CustomTagsFilter
                        selectedCustomTags={selectedCustomTags}
                        onCustomTagsChange={onCustomTagsChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
