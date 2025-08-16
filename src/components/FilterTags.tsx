import { X, ChevronDown, MapPin, Euro, Star, Store, Utensils, Clock, RotateCcw, CircleDollarSign, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import DistanceFilter from './DistanceFilter';
import PriceFilter from './PriceFilter';
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
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  selectedTimeRanges?: number[];
  isOpenNow?: boolean;
  isHighRated?: boolean;
  isBudgetFriendly?: boolean;
  isVegetarianVegan?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'establishment' | 'diet' | 'openNow' | 'timeRange' | 'highRated' | 'budgetFriendly' | 'vegetarianVegan' | 'all', id?: number) => void;
  onDistanceChange?: (distances: number[]) => void;
  onPriceRangeChange?: (ranges: string[]) => void;
  onEstablishmentTypeChange?: (types: number[]) => void;
  onDietTypeChange?: (types: number[]) => void;
  onTimeRangeChange?: (ranges: number[]) => void;
  onOpenNowChange?: (isOpen: boolean) => void;
  onHighRatedChange?: (isHighRated: boolean) => void;
  onBudgetFriendlyChange?: (isBudgetFriendly: boolean) => void;
  onVegetarianVeganChange?: (isVegetarianVegan: boolean) => void;
}

export default function FilterTags({ 
  activeTab, 
  selectedCuisines, 
  selectedFoodTypes,
  selectedDistance = [],
  selectedPriceRanges = [],
  selectedEstablishmentTypes = [],
  selectedDietTypes = [],
  selectedTimeRanges = [],
  isOpenNow = false,
  isHighRated = false,
  isBudgetFriendly = false,
  isVegetarianVegan = false,
  onClearFilter,
  onDistanceChange = () => {},
  onPriceRangeChange = () => {},
  onEstablishmentTypeChange = () => {},
  onDietTypeChange = () => {},
  onTimeRangeChange = () => {},
  onOpenNowChange = () => {},
  onHighRatedChange = () => {},
  onBudgetFriendlyChange = () => {},
  onVegetarianVeganChange = () => {}
}: FilterTagsProps) {
  const isMobile = useIsMobile();
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedDistance.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    selectedTimeRanges.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly ||
    isVegetarianVegan;

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
      case 'distance': return MapPin;
      case 'price': return Euro;
      case 'establishment': return Store;
      case 'diet': return Utensils;
      case 'schedule': return Clock;
      default: return null;
    }
  };

  const getFilterTitle = (filterKey: string) => {
    switch (filterKey) {
      case 'distance': return 'Distancia';
      case 'price': return 'Precio';
      case 'establishment': return 'Tipo de Comercio';
      case 'diet': return 'Dieta';
      case 'schedule': return 'Horarios';
      default: return 'Filtro';
    }
  };

  const getFilterCount = (filterKey: string) => {
    switch (filterKey) {
      case 'distance': return selectedDistance.length;
      case 'price': return selectedPriceRanges.length;
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
          {/* High Rating Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-xs rounded-full border-0 flex items-center gap-2 ${
              isHighRated 
                ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white' 
                : 'text-[#4B4B4B] hover:bg-[#EAEAEA]'
            }`}
            style={isHighRated ? { 
              backgroundColor: '#ef4444',
              color: 'white'
            } : { 
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            }}
            onClick={() => onHighRatedChange(!isHighRated)}
          >
            <Star className={`h-3 w-3 ${isHighRated ? 'text-white fill-white' : 'text-black'}`} />
            +4.5
          </Button>

          {/* Open Now Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-xs rounded-full border-0 flex items-center gap-2 ${
              isOpenNow 
                ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white' 
                : 'text-[#4B4B4B] hover:bg-[#EAEAEA]'
            }`}
            style={isOpenNow ? { 
              backgroundColor: '#ef4444',
              color: 'white'
            } : { 
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            }}
            onClick={() => onOpenNowChange(!isOpenNow)}
          >
            <Clock className={`h-3 w-3 ${isOpenNow ? 'text-white' : 'text-black'}`} />
            Abierto ahora
          </Button>

          {/* Budget Friendly Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-xs rounded-full border-0 flex items-center gap-2 ${
              isBudgetFriendly 
                ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white' 
                : 'text-[#4B4B4B] hover:bg-[#EAEAEA]'
            }`}
            style={isBudgetFriendly ? { 
              backgroundColor: '#ef4444',
              color: 'white'
            } : { 
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            }}
            onClick={() => onBudgetFriendlyChange(!isBudgetFriendly)}
          >
            <CircleDollarSign className={`h-3 w-3 ${isBudgetFriendly ? 'text-white' : 'text-black'}`} />
            Económico
          </Button>

          {/* Vegetarian/Vegan Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-xs rounded-full border-0 flex items-center gap-2 ${
              isVegetarianVegan 
                ? 'bg-red-500 text-white hover:bg-red-500 hover:text-white' 
                : 'text-[#4B4B4B] hover:bg-[#EAEAEA]'
            }`}
            style={isVegetarianVegan ? { 
              backgroundColor: '#ef4444',
              color: 'white'
            } : { 
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            }}
            onClick={() => onVegetarianVeganChange(!isVegetarianVegan)}
          >
            <Leaf className={`h-3 w-3 ${isVegetarianVegan ? 'text-white' : 'text-black'}`} />
            Vegetariano/Vegano
          </Button>

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
