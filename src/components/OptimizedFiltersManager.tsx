
import { useState } from 'react';
import CuisineFilterWithCounts from './CuisineFilterWithCounts';
import PriceFilterWithCounts from './PriceFilterWithCounts';
import EstablishmentTypeFilterWithCounts from './EstablishmentTypeFilterWithCounts';
import SimpleDietFilterWithCounts from './SimpleDietFilterWithCounts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OptimizedFiltersManagerProps {
  selectedCuisines: number[];
  onCuisineChange: (cuisines: number[]) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (ranges: string[]) => void;
  selectedEstablishmentTypes: number[];
  onEstablishmentTypeChange: (types: number[]) => void;
  selectedDietCategories: string[];
  onDietCategoryChange: (categories: string[]) => void;
  cityId?: number;
  userLat?: number;
  userLng?: number;
}

export default function OptimizedFiltersManager({
  selectedCuisines,
  onCuisineChange,
  selectedPriceRanges,
  onPriceRangeChange,
  selectedEstablishmentTypes,
  onEstablishmentTypeChange,
  selectedDietCategories,
  onDietCategoryChange,
  cityId,
  userLat,
  userLng
}: OptimizedFiltersManagerProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filterName: string) => {
    setActiveFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
  };

  const clearAllFilters = () => {
    onCuisineChange([]);
    onPriceRangeChange([]);
    onEstablishmentTypeChange([]);
    onDietCategoryChange([]);
  };

  const totalActiveFilters = selectedCuisines.length + selectedPriceRanges.length + 
                            selectedEstablishmentTypes.length + selectedDietCategories.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={activeFilters.includes('cuisine') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('cuisine')}
          >
            Cocina
            {selectedCuisines.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCuisines.length}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant={activeFilters.includes('price') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('price')}
          >
            Precio
            {selectedPriceRanges.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedPriceRanges.length}
              </Badge>
            )}
          </Button>
          
          <Button 
            variant={activeFilters.includes('establishment') ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleFilter('establishment')}
          >
            Tipo
            {selectedEstablishmentTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedEstablishmentTypes.length}
              </Badge>
            )}
          </Button>
        </div>

        {totalActiveFilters > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Diet filter is always visible */}
      <div>
        <SimpleDietFilterWithCounts
          selectedDietCategories={selectedDietCategories}
          onDietCategoryChange={onDietCategoryChange}
          cityId={cityId}
          userLat={userLat}
          userLng={userLng}
        />
      </div>

      {/* Expandable filter sections */}
      {activeFilters.includes('cuisine') && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tipos de Cocina</h4>
          <CuisineFilterWithCounts
            selectedCuisines={selectedCuisines}
            onCuisineChange={onCuisineChange}
            cityId={cityId}
            userLat={userLat}
            userLng={userLng}
          />
        </div>
      )}

      {activeFilters.includes('price') && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Rango de Precios</h4>
          <PriceFilterWithCounts
            selectedPriceRanges={selectedPriceRanges}
            onPriceRangeChange={onPriceRangeChange}
            cityId={cityId}
            userLat={userLat}
            userLng={userLng}
          />
        </div>
      )}

      {activeFilters.includes('establishment') && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tipo de Establecimiento</h4>
          <EstablishmentTypeFilterWithCounts
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            onEstablishmentTypeChange={onEstablishmentTypeChange}
            cityId={cityId}
            userLat={userLat}
            userLng={userLng}
          />
        </div>
      )}
    </div>
  );
}
