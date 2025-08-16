
import { X, ChevronDown, Euro, Star, Store, Utensils, Clock, RotateCcw, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import PriceFilter from './PriceFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import DietFilter from './DietFilter';
import { useState, useCallback, useMemo } from 'react';

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

  const filterConfig = useMemo(() => ({
    price: {
      icon: Euro,
      title: 'Precio',
      count: selectedPriceRanges.length,
      isActive: selectedPriceRanges.length > 0
    },
    establishment: {
      icon: Store,
      title: 'Tipo de Comercio',
      count: selectedEstablishmentTypes.length,
      isActive: selectedEstablishmentTypes.length > 0
    },
    diet: {
      icon: Utensils,
      title: 'Dieta',
      count: selectedDietTypes.length,
      isActive: selectedDietTypes.length > 0
    }
  }), [selectedPriceRanges.length, selectedEstablishmentTypes.length, selectedDietTypes.length]);

  const handleOpenModal = useCallback((filterKey: string) => {
    setActiveFilterModal(filterKey);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveFilterModal(null);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setActiveFilterModal(null);
  }, []);

  const handleResetFilters = useCallback(() => {
    onClearFilter('all');
    setActiveFilterModal(null);
  }, [onClearFilter]);

  // Wrapper for filter change handlers to prevent modal closing
  const handlePriceRangeChangeWrapper = useCallback((ranges: string[]) => {
    onPriceRangeChange(ranges);
  }, [onPriceRangeChange]);

  const handleEstablishmentTypeChangeWrapper = useCallback((types: number[]) => {
    onEstablishmentTypeChange(types);
  }, [onEstablishmentTypeChange]);

  const handleDietTypeChangeWrapper = useCallback((types: number[]) => {
    onDietTypeChange(types);
  }, [onDietTypeChange]);

  const getFilterContent = (filterKey: string) => {
    switch (filterKey) {
      case 'price':
        return (
          <div className="[&_label]:text-base space-y-4" onClick={(e) => e.stopPropagation()}>
            <PriceFilter
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={handlePriceRangeChangeWrapper}
            />
          </div>
        );
      case 'establishment':
        return (
          <div className="[&_label]:text-base space-y-4" onClick={(e) => e.stopPropagation()}>
            <EstablishmentTypeFilter
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              onEstablishmentTypeChange={handleEstablishmentTypeChangeWrapper}
            />
          </div>
        );
      case 'diet':
        return (
          <div className="[&_label]:text-base space-y-4" onClick={(e) => e.stopPropagation()}>
            <DietFilter
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={handleDietTypeChangeWrapper}
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

  const FilterTrigger = ({ children, filterKey }: { children: React.ReactNode, filterKey: string }) => {
    const config = filterConfig[filterKey as keyof typeof filterConfig];
    if (!config) return null;

    const { icon: FilterIcon, isActive, count } = config;

    return (
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
        onClick={() => handleOpenModal(filterKey)}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgb(238, 238, 238)';
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
    );
  };

  const FilterContent = ({ filterKey }: { filterKey: string }) => {
    const config = filterConfig[filterKey as keyof typeof filterConfig];
    if (!config) return null;

    return (
      <div className="flex flex-col h-full">
        {/* Header with proper accessibility */}
        <SheetHeader className="text-center py-4 border-b border-gray-100 flex-shrink-0">
          <SheetTitle className="text-lg font-semibold">{config.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Configura los filtros de {config.title.toLowerCase()}
          </SheetDescription>
        </SheetHeader>
        
        {/* Filter content - scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="[&>div>div:not(:last-child)]:border-b [&>div>div:not(:last-child)]:border-gray-100 [&>div>div:not(:last-child)]:pb-4 [&>div>div:not(:first-child)]:pt-4">
            {getFilterContent(filterKey)}
          </div>
        </div>
        
        {/* Bottom buttons - fixed at bottom */}
        <div className="flex-shrink-0 p-4 space-y-3 border-t border-gray-100 bg-background">
          <Button 
            onClick={handleApplyFilters}
            className="w-full h-12 text-base"
          >
            Aplicar filtros
          </Button>
          <Button 
            onClick={handleResetFilters}
            variant="ghost"
            className="w-full h-12 text-base bg-transparent border-0"
          >
            Restablecer
          </Button>
        </div>
      </div>
    );
  };

  const filterTags = [
    { key: 'price', label: 'Precio' },
    ...(activeTab === 'restaurants' ? [{ key: 'establishment', label: 'Tipo' }] : []),
    { key: 'diet', label: 'Dieta' },
  ];

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
                e.currentTarget.style.backgroundColor = 'rgb(238, 238, 238)';
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
                e.currentTarget.style.backgroundColor = 'rgb(238, 238, 238)';
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
                e.currentTarget.style.backgroundColor = 'rgb(238, 238, 238)';
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

          {/* Filter Dropdown Triggers */}
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

      {/* Separate Sheet components for each filter */}
      {filterTags.map((filter) => (
        <Sheet 
          key={`${filter.key}-modal`} 
          open={activeFilterModal === filter.key} 
          onOpenChange={(open) => {
            if (!open) {
              handleCloseModal();
            }
          }}
        >
          <SheetContent 
            side="bottom" 
            className={`p-0 ${
              isMobile 
                ? 'h-[100dvh] rounded-none max-h-[100dvh]' 
                : 'rounded-t-[20px] rounded-b-none h-[80vh] max-h-[80vh]'
            }`}
          >
            <FilterContent filterKey={filter.key} />
          </SheetContent>
        </Sheet>
      ))}
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
