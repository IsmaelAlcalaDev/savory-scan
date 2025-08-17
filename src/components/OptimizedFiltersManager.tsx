
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import CuisineFilterWithCounts from './CuisineFilterWithCounts';
import PriceFilterWithCounts from './PriceFilterWithCounts';
import EstablishmentTypeFilterWithCounts from './EstablishmentTypeFilterWithCounts';
import SimpleDietFilter from './SimpleDietFilter';
import { useFacetCounts } from '@/hooks/useFacetCounts';

interface OptimizedFiltersManagerProps {
  searchQuery: string;
  cuisineTypeIds: number[];
  priceRanges: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes: number[];
  selectedDietTypes: number[];
  isOpenNow: boolean;
  cityId?: number;
  userLat?: number;
  userLng?: number;
  onCuisineChange: (ids: number[]) => void;
  onPriceChange: (ranges: string[]) => void;
  onHighRatedChange: (isHighRated: boolean) => void;
  onEstablishmentTypeChange: (types: number[]) => void;
  onDietTypeChange: (types: number[]) => void;
  onOpenNowChange: (isOpenNow: boolean) => void;
  onClearAll: () => void;
}

export default function OptimizedFiltersManager({
  searchQuery,
  cuisineTypeIds,
  priceRanges,
  isHighRated,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow,
  cityId,
  userLat,
  userLng,
  onCuisineChange,
  onPriceChange,
  onHighRatedChange,
  onEstablishmentTypeChange,
  onDietTypeChange,
  onOpenNowChange,
  onClearAll
}: OptimizedFiltersManagerProps) {
  const [showFilters, setShowFilters] = useState(false);
  const { facetData, loading: facetsLoading } = useFacetCounts({ 
    cityId, 
    userLat, 
    userLng 
  });

  // Calculate active filters count
  const activeFiltersCount = 
    cuisineTypeIds.length +
    priceRanges.length +
    selectedEstablishmentTypes.length +
    selectedDietTypes.length +
    (isHighRated ? 1 : 0) +
    (isOpenNow ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // Auto-hide filters on mobile when no active filters
  useEffect(() => {
    if (!hasActiveFilters && window.innerWidth < 768) {
      setShowFilters(false);
    }
  }, [hasActiveFilters]);

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {isHighRated && (
            <Badge variant="secondary" className="flex items-center gap-1">
              ⭐ Mejor valorados
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onHighRatedChange(false)}
              />
            </Badge>
          )}
          {isOpenNow && (
            <Badge variant="secondary" className="flex items-center gap-1">
              🕐 Abierto ahora
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onOpenNowChange(false)}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="space-y-6 p-4 border rounded-lg bg-card">
          {!facetsLoading && facetData && (
            <>
              <CuisineFilterWithCounts
                selectedCuisineIds={cuisineTypeIds}
                onCuisineChange={onCuisineChange}
                facetData={facetData}
              />

              <PriceFilterWithCounts
                selectedPriceRanges={priceRanges}
                onPriceRangeChange={onPriceChange}
                facetData={facetData}
              />

              <EstablishmentTypeFilterWithCounts
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                onEstablishmentTypeChange={onEstablishmentTypeChange}
                facetData={facetData}
              />

              <SimpleDietFilter
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={onDietTypeChange}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={isHighRated ? "default" : "outline"}
                  size="sm"
                  onClick={() => onHighRatedChange(!isHighRated)}
                >
                  ⭐ Mejor valorados
                </Button>

                <Button
                  variant={isOpenNow ? "default" : "outline"}
                  size="sm"
                  onClick={() => onOpenNowChange(!isOpenNow)}
                >
                  🕐 Abierto ahora
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
