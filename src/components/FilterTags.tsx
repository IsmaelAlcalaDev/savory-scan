
import { X, ChevronDown, Euro, Star, Store, Utensils, Clock, RotateCcw, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import PriceFilter from './PriceFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import DietFilter from './DietFilter';
import { useState } from 'react';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  isHighRated?: boolean;
  isBudgetFriendly?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'openNow' | 'highRated' | 'budgetFriendly' | 'all', id?: number) => void;
  onPriceRangeChange?: (ranges: string[]) => void;
  onEstablishmentTypeChange?: (types: number[]) => void;
  onDietTypeChange?: (types: number[]) => void;
  onOpenNowChange?: (isOpen: boolean) => void;
  onHighRatedChange?: (isHighRated: boolean) => void;
  onBudgetFriendlyChange?: (isBudgetFriendly: boolean) => void;
}

export default function FilterTags({ 
  activeTab, 
  selectedCuisines, 
  selectedFoodTypes,
  selectedPriceRanges = [],
  selectedEstablishmentTypes = [],
  selectedDietTypes = [],
  isOpenNow = false,
  isHighRated = false,
  isBudgetFriendly = false,
  onClearFilter,
  onPriceRangeChange = () => {},
  onEstablishmentTypeChange = () => {},
  onDietTypeChange = () => {},
  onOpenNowChange = () => {},
  onHighRatedChange = () => {},
  onBudgetFriendlyChange = () => {}
}: FilterTagsProps) {
  const isMobile = useIsMobile();
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly;

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return Euro;
      case 'establishment': return Store;
      case 'diet': return Utensils;
      default: return null;
    }
  };

  const getFilterTitle = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return 'Precio';
      case 'establishment': return 'Tipo de Comercio';
      case 'diet': return 'Dieta';
      default: return 'Filtro';
    }
  };

  const getFilterCount = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return selectedPriceRanges.length;
      case 'establishment': return selectedEstablishmentTypes.length;
      case 'diet': return selectedDietTypes.length;
      default: return 0;
    }
  };

  const isFilterActive = (filterKey: string) => {
    return getFilterCount(filterKey) > 0;
  };

  const getFilterContent = (filterKey: string) => {
    switch (filterKey) {
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

  const filterTags = [
    { key: 'price', label: 'Precio' },
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo' }] : []),
    { key: 'diet', label: 'Dieta' },
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
          className={`flex-shrink-0 h-8 px-4 text-sm rounded-full border-0 flex items-center gap-2 relative ${
            isActive 
              ? 'bg-black text-white hover:bg-black hover:text-white' 
              : 'text-black hover:text-black'
          }`}
          style={isActive ? { 
            backgroundColor: '#000000',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600'
          } : { 
            backgroundColor: '#F3F3F3',
            color: 'black',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onClick={() => handleOpenChange(true)}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'rgb(248, 248, 248)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = '#F3F3F3';
            }
          }}
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
            className={`flex-shrink-0 h-8 px-4 text-sm rounded-full border-0 flex items-center gap-2 ${
              isHighRated 
                ? 'bg-black text-white hover:bg-black hover:text-white' 
                : 'text-black hover:text-black'
            }`}
            style={isHighRated ? { 
              backgroundColor: '#000000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            } : { 
              backgroundColor: '#F3F3F3',
              color: 'black',
              fontSize: '14px',
              fontWeight: '600'
            }}
            onClick={() => onHighRatedChange(!isHighRated)}
            onMouseEnter={(e) => {
              if (!isHighRated) {
                e.currentTarget.style.backgroundColor = 'rgb(248, 248, 248)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighRated) {
                e.currentTarget.style.backgroundColor = '#F3F3F3';
              }
            }}
          >
            <Star className={`h-3 w-3 ${isHighRated ? 'text-white fill-white' : 'text-black'}`} />
            +4.5
          </Button>

          {/* Open Now Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-sm rounded-full border-0 flex items-center gap-2 ${
              isOpenNow 
                ? 'bg-black text-white hover:bg-black hover:text-white' 
                : 'text-black hover:text-black'
            }`}
            style={isOpenNow ? { 
              backgroundColor: '#000000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            } : { 
              backgroundColor: '#F3F3F3',
              color: 'black',
              fontSize: '14px',
              fontWeight: '600'
            }}
            onClick={() => onOpenNowChange(!isOpenNow)}
            onMouseEnter={(e) => {
              if (!isOpenNow) {
                e.currentTarget.style.backgroundColor = 'rgb(248, 248, 248)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isOpenNow) {
                e.currentTarget.style.backgroundColor = '#F3F3F3';
              }
            }}
          >
            <Clock className={`h-3 w-3 ${isOpenNow ? 'text-white' : 'text-black'}`} />
            Abierto ahora
          </Button>

          {/* Budget Friendly Quick Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={`flex-shrink-0 h-8 px-4 text-sm rounded-full border-0 flex items-center gap-2 ${
              isBudgetFriendly 
                ? 'bg-black text-white hover:bg-black hover:text-white' 
                : 'text-black hover:text-black'
            }`}
            style={isBudgetFriendly ? { 
              backgroundColor: '#000000',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            } : { 
              backgroundColor: '#F3F3F3',
              color: 'black',
              fontSize: '14px',
              fontWeight: '600'
            }}
            onClick={() => onBudgetFriendlyChange(!isBudgetFriendly)}
            onMouseEnter={(e) => {
              if (!isBudgetFriendly) {
                e.currentTarget.style.backgroundColor = 'rgb(248, 248, 248)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isBudgetFriendly) {
                e.currentTarget.style.backgroundColor = '#F3F3F3';
              }
            }}
          >
            <CircleDollarSign className={`h-3 w-3 ${isBudgetFriendly ? 'text-white' : 'text-black'}`} />
            Económico
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

          /* Force black hover on active filter buttons */
          .bg-black:hover {
            background-color: #000000 !important;
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
      className="flex items-center gap-1 text-xs text-black h-auto p-2 hover:bg-transparent bg-transparent"
      onClick={onClearAll}
    >
      <RotateCcw className="h-3 w-3" />
      Restablecer
    </Button>
  );
};
