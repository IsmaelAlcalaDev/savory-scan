import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import FilterDialog from './FilterDialog';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedDistance?: number[];
  selectedPriceRanges?: string[];
  selectedRating?: number;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  selectedSort?: string;
  isOpenNow?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'sort' | 'all', id?: number) => void;
  onSortChange?: (sortId: string) => void;
  onDistanceChange?: (distances: number[]) => void;
}

export default function FilterTags({ 
  activeTab, 
  selectedCuisines, 
  selectedFoodTypes,
  selectedDistance = [],
  selectedPriceRanges = [],
  selectedRating,
  selectedEstablishmentTypes = [],
  selectedDietTypes = [],
  selectedSort = 'relevance',
  isOpenNow = false,
  onClearFilter,
  onSortChange = () => {},
  onDistanceChange = () => {}
}: FilterTagsProps) {
  
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedDistance.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedRating || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    isOpenNow ||
    selectedSort !== 'relevance';

  const filterTags = [
    { key: 'sort', label: 'Ordenar' },
    { key: 'distance', label: 'Distancia' },
    { key: 'price', label: 'Precio' },
    { key: 'rating', label: 'Valoración' },
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo de comercio' }] : []),
    { key: 'diet', label: 'Dieta' },
    { key: 'schedule', label: 'Horarios' },
  ];

  const quickFilters = [
    { key: 'best-rated', label: 'Mejor valorados', active: selectedSort === 'rating' },
    { key: 'open-now', label: 'Abierto ahora', active: isOpenNow },
    { key: 'nearest', label: 'Más cerca', active: selectedSort === 'distance' },
    { key: 'cheapest', label: 'Más económico', active: selectedSort === 'price_low' },
  ];

  const handleQuickFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'best-rated':
        onSortChange(selectedSort === 'rating' ? 'relevance' : 'rating');
        break;
      case 'open-now':
        onClearFilter('openNow');
        break;
      case 'nearest':
        onSortChange(selectedSort === 'distance' ? 'relevance' : 'distance');
        break;
      case 'cheapest':
        onSortChange(selectedSort === 'price_low' ? 'relevance' : 'price_low');
        break;
    }
  };

  return (
    <div className="w-full py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* Filter Tags */}
        {filterTags.map((filter) => (
          <FilterDialog
            key={filter.key}
            filterType={filter.key as any}
            filterLabel={filter.label}
            selectedSort={selectedSort}
            selectedDistances={selectedDistance}
            onSortChange={onSortChange}
            onDistanceChange={onDistanceChange}
            onApply={() => {}}
            onReset={() => {
              if (filter.key === 'sort') {
                onClearFilter('sort');
              } else if (filter.key === 'distance') {
                onClearFilter('distance');
              }
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 h-8 px-4 text-xs rounded-full border-0"
              style={{ 
                backgroundColor: '#F3F3F3',
                color: '#4B4B4B'
              }}
            >
              {filter.label}
            </Button>
          </FilterDialog>
        ))}

        {/* Separador */}
        <div className="h-8 w-px bg-gray-200 flex-shrink-0" />

        {/* Quick Filters */}
        {quickFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="outline"
            className={`flex-shrink-0 h-8 px-4 text-xs rounded-full cursor-pointer border-0 ${
              filter.active
                ? 'bg-green-100 text-green-800' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            style={!filter.active ? { 
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            } : {}}
            onClick={() => handleQuickFilter(filter.key)}
          >
            {filter.label}
            {filter.active && <X className="h-3 w-3 ml-1" />}
          </Badge>
        ))}

        {/* Active Filters */}
        {selectedCuisines.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedCuisines.length} cocina{selectedCuisines.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('cuisine')}
            />
          </Badge>
        )}

        {selectedFoodTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedFoodTypes.length} tipo{selectedFoodTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('foodType')}
            />
          </Badge>
        )}

        {selectedDistance.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            Distancia
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('distance')}
            />
          </Badge>
        )}

        {selectedPriceRanges.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedPriceRanges.length} precio{selectedPriceRanges.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('price')}
            />
          </Badge>
        )}

        {selectedRating && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedRating}+ estrellas
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('rating')}
            />
          </Badge>
        )}

        {selectedEstablishmentTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedEstablishmentTypes.length} tipo{selectedEstablishmentTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('establishment')}
            />
          </Badge>
        )}

        {selectedDietTypes.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedDietTypes.length} dieta{selectedDietTypes.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('diet')}
            />
          </Badge>
        )}

        {/* Clear all filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 px-4 text-xs text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => onClearFilter('all')}
          >
            Limpiar todo
          </Button>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
