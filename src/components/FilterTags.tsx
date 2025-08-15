
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
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="text-center py-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-lg font-semibold">{getFilterTitle(filterKey)}</h3>
      </div>
      
      {/* Filter content - scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        <div className="[&>div>div:not(:last-child)]:border-b [&>div>div:not(:last-child)]:border-gray-100 [&>div>div:not(:last-child)]:pb-4 [&>div>div:not(:first-child)]:pt-4">
          {getFilterContent(filterKey)}
        </div>
      </div>
      
      {/* Bottom buttons - fixed at bottom */}
      <div className="flex-shrink-0 p-4 space-y-3 border-t border-gray-100 bg-background">
        <Button 
          onClick={onApply}
          className="w-full h-12 text-base"
        >
          Aplicar filtros
        </Button>
        <Button 
          onClick={onReset}
          variant="ghost"
          className="w-full h-12 text-base bg-transparent border-0"
        >
          Restablecer
        </Button>
      </div>
    </div>
  );

  // Reordered filter tags based on UX psychology principles
  const filterTags = [
    { key: 'distance', label: 'Distancia' },
    { key: 'price', label: 'Precio' },
    { key: 'rating', label: 'Valoración' },
    { key: 'sort', label: 'Ordenar' },
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo' }] : []),
    { key: 'diet', label: 'Dieta' },
    { key: 'schedule', label: 'Horarios' },
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
              ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white' 
              : 'text-[#4B4B4B] hover:bg-[#EAEAEA]'
          }`}
          style={isActive ? { 
            backgroundColor: '#ef4444',
            color: 'white'
          } : { 
            backgroundColor: '#F3F3F3',
            color: '#4B4B4B'
          }}
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
              ? 'h-[100dvh] rounded-none max-h-[100dvh]' 
              : 'rounded-t-[20px] rounded-b-none h-[80vh] max-h-[80vh]'
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

  return (
    <>
      <div className="w-full py-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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

          /* Force disable hover on active filter buttons */
          .bg-red-500:hover {
            background-color: #ef4444 !important;
            color: white !important;
          }

          /* Improve touch targets for mobile */
          @media (max-width: 768px) {
            .peer {
              width: 24px !important;
              height: 24px !important;
            }
            
            [data-radix-collection-item] input[type="checkbox"] {
              width: 24px;
              height: 24px;
            }
            
            .space-x-2 > :not([hidden]) ~ :not([hidden]) {
              margin-left: 16px;
            }
          }
        `}</style>
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
      className="flex items-center gap-1 text-xs bg-black text-white h-auto p-2 rounded-full"
      onClick={onClearAll}
    >
      <RotateCcw className="h-3 w-3" />
      Restablecer
    </Button>
  );
};
