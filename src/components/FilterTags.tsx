import { X, ChevronDown, MapPin, Euro, Star, ArrowUpDown, Store, Utensils, Clock, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
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

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
      case 'distance': return MapPin;
      case 'price': return Euro;
      case 'rating': return Star;
      case 'sort': return ArrowUpDown;
      case 'establishment': return Store;
      case 'diet': return Utensils;
      case 'schedule': return Clock;
      default: return null;
    }
  };

  const getFilterTitle = (filterKey: string) => {
    switch (filterKey) {
      case 'sort': return 'Ordenar';
      case 'distance': return 'Distancia';
      case 'price': return 'Precio';
      case 'rating': return 'Valoración';
      case 'establishment': return 'Tipo de Comercio';
      case 'diet': return 'Dieta';
      case 'schedule': return 'Horarios';
      default: return 'Filtro';
    }
  };

  // Function to get the count of active filters for each filter type
  const getFilterCount = (filterKey: string) => {
    switch (filterKey) {
      case 'sort': return selectedSort ? 1 : 0;
      case 'distance': return selectedDistance.length;
      case 'price': return selectedPriceRanges.length;
      case 'rating': return selectedRating ? 1 : 0;
      case 'establishment': return selectedEstablishmentTypes.length;
      case 'diet': return selectedDietTypes.length;
      case 'schedule': return selectedTimeRanges.length + (isOpenNow ? 1 : 0);
      default: return 0;
    }
  };

  // Function to check if a specific filter is active
  const isFilterActive = (filterKey: string) => {
    return getFilterCount(filterKey) > 0;
  };

  const getFilterContent = (filterKey: string) => {
    switch (filterKey) {
      case 'sort':
        return (
          <div className="[&_label]:text-base">
            <SortFilter
              selectedSort={selectedSort}
              onSortChange={onSortChange}
            />
          </div>
        );
      case 'distance':
        return (
          <div className="[&_label]:text-base space-y-4">
            <DistanceFilter
              selectedDistances={selectedDistance}
              onDistanceChange={onDistanceChange}
            />
          </div>
        );
      case 'price':
        return (
          <div className="[&_label]:text-base space-y-4">
            <PriceFilter
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={onPriceRangeChange}
            />
          </div>
        );
      case 'rating':
        return (
          <div className="[&_label]:text-base space-y-4">
            <RatingFilter
              selectedRating={selectedRating}
              onRatingChange={onRatingChange}
            />
          </div>
        );
      case 'establishment':
        return (
          <div className="[&_label]:text-base space-y-4">
            <EstablishmentTypeFilter
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              onEstablishmentTypeChange={onEstablishmentTypeChange}
            />
          </div>
        );
      case 'diet':
        return (
          <div className="[&_label]:text-base space-y-4">
            <DietFilter
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={onDietTypeChange}
            />
          </div>
        );
      case 'schedule':
        return (
          <div className="[&_label]:text-base space-y-4">
            <TimeRangeFilter
              selectedTimeRanges={selectedTimeRanges}
              onTimeRangeChange={onTimeRangeChange}
              isOpenNow={isOpenNow}
              onOpenNowChange={onOpenNowChange}
            />
          </div>
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
    <div className={`flex flex-col ${isMobile ? 'h-full' : ''}`}>
      {/* Title */}
      <div className="text-center py-4">
        <h3 className="text-lg font-semibold">{getFilterTitle(filterKey)}</h3>
      </div>
      
      {/* Filter content with dividing lines */}
      <div className={`px-6 [&>div>div:not(:last-child)]:border-b [&>div>div:not(:last-child)]:border-gray-100 [&>div>div:not(:last-child)]:pb-4 [&>div>div:not(:first-child)]:pt-4 ${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
        {getFilterContent(filterKey)}
      </div>
      
      {/* Bottom buttons - Apply and Reset */}
      <div className={`p-4 space-y-3 ${isMobile ? 'mt-auto' : ''}`}>
        <Button 
          onClick={onApply}
          className="w-full"
        >
          Aplicar filtros
        </Button>
        <Button 
          onClick={onReset}
          variant="ghost"
          className="w-full bg-transparent border-0 hover:bg-gray-50"
        >
          Restablecer
        </Button>
      </div>
    </div>
  );

  // Reordered filter tags based on UX psychology principles
  const filterTags = [
    { key: 'distance', label: 'Distancia' },      // 1. Proximidad física - criterio primario
    { key: 'price', label: 'Precio' },            // 2. Consideración económica - criterio secundario
    { key: 'rating', label: 'Valoración' },       // 3. Validación social y calidad
    { key: 'sort', label: 'Ordenar' },            // 4. Herramienta de organización
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo' }] : []), // 5. Categorización específica
    { key: 'diet', label: 'Dieta' },              // 6. Necesidades específicas
    { key: 'schedule', label: 'Horarios' },       // 7. Disponibilidad temporal
  ];

  const FilterTrigger = ({ children, filterKey }: { children: React.ReactNode, filterKey: string }) => {
    const handleOpenChange = (open: boolean) => {
      setActiveFilterModal(open ? filterKey : null);
    };

    const FilterIcon = getFilterIcon(filterKey);
    const isActive = isFilterActive(filterKey);
    const count = getFilterCount(filterKey);

    return (
      <Sheet open={activeFilterModal === filterKey} onOpenChange={handleOpenChange}>
        <Button
          variant="outline"
          size="sm"
          className={`flex-shrink-0 h-8 px-4 text-xs rounded-full border-0 flex items-center gap-2 relative ${
            isActive 
              ? 'bg-red-500 text-white' 
              : 'text-[#4B4B4B] hover:bg-gray-50'
          }`}
          style={!isActive ? { 
            backgroundColor: '#F3F3F3',
            color: '#4B4B4B'
          } : {}}
          onClick={() => handleOpenChange(true)}
        >
          {FilterIcon && <FilterIcon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-black'}`} />}
          {children}
          {count > 0 && ` (${count})`}
          <ChevronDown className={`h-3 w-3 ${isActive ? 'text-white' : 'text-black'}`} />
        </Button>
        <SheetContent 
          side="bottom" 
          className={`p-0 ${
            isMobile 
              ? 'h-[100vh] rounded-none' 
              : 'rounded-t-[20px] rounded-b-none h-auto'
          }`}
        >
          <FilterContent 
            filterKey={filterKey}
            onApply={() => setActiveFilterModal(null)} 
            onReset={() => onClearFilter('all')} 
          />
        </SheetContent>
      </Sheet>
    );
  };

  // Component to render the reset button next to results
  const ResetFiltersButton = () => {
    if (!hasActiveFilters) return null;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground h-auto p-1"
        onClick={() => onClearFilter('all')}
      >
        <RotateCcw className="h-3 w-3" />
        Restablecer
      </Button>
    );
  };

  return (
    <>
      <div className="w-full py-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {/* Filter Tags */}
          {filterTags.map((filter) => (
            <FilterTrigger key={filter.key} filterKey={filter.key}>
              {filter.label}
            </FilterTrigger>
          ))}
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Custom checkbox styles */
          [data-radix-collection-item] input[type="checkbox"] {
            width: 20px;
            height: 20px;
            border-radius: 2px;
          }
          
          .peer {
            width: 20px !important;
            height: 20px !important;
            border-radius: 2px !important;
          }
          
          /* Increase spacing between checkbox and label */
          .space-x-2 > :not([hidden]) ~ :not([hidden]) {
            margin-left: 12px;
          }
        `}</style>
      </div>
      
      {/* Export the ResetFiltersButton component for use in results header */}
      <div style={{ display: 'none' }}>
        <ResetFiltersButton />
      </div>
    </>
  );
}

// Export the ResetFiltersButton as a separate component
export const ResetFiltersButton = ({ hasActiveFilters, onClearAll }: { hasActiveFilters: boolean, onClearAll: () => void }) => {
  if (!hasActiveFilters) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1 text-xs bg-black text-white hover:bg-gray-800 h-auto p-2 rounded-full"
      onClick={onClearAll}
    >
      <RotateCcw className="h-3 w-3" />
      Restablecer
    </Button>
  );
};
