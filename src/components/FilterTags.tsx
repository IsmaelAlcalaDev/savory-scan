
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SortFilter from './SortFilter';
import DistanceFilter from './DistanceFilter';
import PriceFilter from './PriceFilter';
import RatingFilter from './RatingFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import DietFilter from './DietFilter';
import TimeRangeFilter from './TimeRangeFilter';
import { useState } from 'react';

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
  selectedTimeRanges?: number[];
  isOpenNow?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'sort' | 'timeRange' | 'all', id?: number) => void;
  onSortChange?: (sort: string) => void;
  onDistanceChange?: (distances: number[]) => void;
  onPriceRangeChange?: (ranges: string[]) => void;
  onRatingChange?: (rating: number | undefined) => void;
  onEstablishmentTypeChange?: (types: number[]) => void;
  onDietTypeChange?: (types: number[]) => void;
  onTimeRangeChange?: (ranges: number[]) => void;
  onOpenNowChange?: (isOpen: boolean) => void;
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
  selectedSort,
  selectedTimeRanges = [],
  isOpenNow = false,
  onClearFilter,
  onSortChange = () => {},
  onDistanceChange = () => {},
  onPriceRangeChange = () => {},
  onRatingChange = () => {},
  onEstablishmentTypeChange = () => {},
  onDietTypeChange = () => {},
  onTimeRangeChange = () => {},
  onOpenNowChange = () => {}
}: FilterTagsProps) {
  const isMobile = useIsMobile();
  const isTablet = !isMobile && window.innerWidth < 1024;
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedDistance.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedRating || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    selectedSort ||
    selectedTimeRanges.length > 0 ||
    isOpenNow;

  const getFilterContent = (filterKey: string) => {
    switch (filterKey) {
      case 'sort':
        return (
          <SortFilter
            selectedSort={selectedSort}
            onSortChange={onSortChange}
          />
        );
      case 'distance':
        return (
          <DistanceFilter
            selectedDistances={selectedDistance}
            onDistanceChange={onDistanceChange}
          />
        );
      case 'price':
        return (
          <PriceFilter
            selectedPriceRanges={selectedPriceRanges}
            onPriceRangeChange={onPriceRangeChange}
          />
        );
      case 'rating':
        return (
          <RatingFilter
            selectedRating={selectedRating}
            onRatingChange={onRatingChange}
          />
        );
      case 'establishment':
        return (
          <EstablishmentTypeFilter
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            onEstablishmentTypeChange={onEstablishmentTypeChange}
          />
        );
      case 'diet':
        return (
          <DietFilter
            selectedDietTypes={selectedDietTypes}
            onDietTypeChange={onDietTypeChange}
          />
        );
      case 'schedule':
        return (
          <TimeRangeFilter
            selectedTimeRanges={selectedTimeRanges}
            onTimeRangeChange={onTimeRangeChange}
            isOpenNow={isOpenNow}
            onOpenNowChange={onOpenNowChange}
          />
        );
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            Filtro no disponible
          </div>
        );
    }
  };

  const FilterContent = ({ filterKey, onApply, onReset }: { filterKey: string, onApply: () => void, onReset: () => void }) => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Filtros</h3>
        <p className="text-sm text-muted-foreground">
          Personaliza tu búsqueda de {activeTab === 'dishes' ? 'platos' : 'restaurantes'}
        </p>
      </div>
      
      {/* Filter content */}
      <div className="max-h-[60vh] overflow-y-auto">
        {getFilterContent(filterKey)}
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onReset}
          variant="outline" 
          className="flex-1"
        >
          Restablecer
        </Button>
        <Button 
          onClick={onApply}
          className="flex-1"
        >
          Aplicar filtros
        </Button>
      </div>
    </div>
  );

  const filterTags = [
    { key: 'sort', label: 'Ordenar' },
    { key: 'distance', label: 'Distancia' },
    { key: 'price', label: 'Precio' },
    { key: 'rating', label: 'Valoración' },
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo' }] : []),
    { key: 'diet', label: 'Dieta' },
    { key: 'schedule', label: 'Horarios' },
  ];

  const quickFilters = [
    { key: 'best-rated', label: 'Mejor valorados', active: false },
    { key: 'open-now', label: 'Abierto ahora', active: isOpenNow },
    { key: 'nearest', label: 'Más cerca', active: false },
    { key: 'cheapest', label: 'Más económico', active: false },
  ];

  const FilterTrigger = ({ children, filterKey }: { children: React.ReactNode, filterKey: string }) => {
    const handleOpenChange = (open: boolean) => {
      setActiveFilterModal(open ? filterKey : null);
    };

    if (isMobile || isTablet) {
      return (
        <Sheet open={activeFilterModal === filterKey} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>
            {children}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh]">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Personaliza tu búsqueda de {activeTab === 'dishes' ? 'platos' : 'restaurantes'}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <FilterContent 
                filterKey={filterKey}
                onApply={() => setActiveFilterModal(null)} 
                onReset={() => onClearFilter('all')} 
              />
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={activeFilterModal === filterKey} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
            <DialogDescription>
              Personaliza tu búsqueda de {activeTab === 'dishes' ? 'platos' : 'restaurantes'}
            </DialogDescription>
          </DialogHeader>
          <FilterContent 
            filterKey={filterKey}
            onApply={() => setActiveFilterModal(null)} 
            onReset={() => onClearFilter('all')} 
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="w-full py-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {/* Filter Tags */}
        {filterTags.map((filter) => (
          <FilterTrigger key={filter.key} filterKey={filter.key}>
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
          </FilterTrigger>
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
            onClick={() => {
              if (filter.key === 'open-now') {
                onClearFilter('openNow');
              }
              // TODO: Implement other quick filters
            }}
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

        {selectedSort && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            Ordenado
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('sort')}
            />
          </Badge>
        )}

        {selectedTimeRanges.length > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 h-8 px-4 text-xs rounded-full bg-primary/10 text-primary border-primary/20"
          >
            {selectedTimeRanges.length} horario{selectedTimeRanges.length > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 ml-1 cursor-pointer hover:text-primary/70" 
              onClick={() => onClearFilter('timeRange')}
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
