import { X, ChevronDown, Euro, Star, Store, Utensils, Clock, RotateCcw, CircleDollarSign, Tags, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import PriceFilter from './PriceFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import DietFilter from './DietFilter';
import CustomTagsFilter from './CustomTagsFilter';
import DishDietFilter from './DishDietFilter';
import SpiceFilter from './SpiceFilter';
import { useState } from 'react';

interface FilterTagsProps {
  activeTab: 'restaurants' | 'dishes';
  selectedCuisines: number[];
  selectedFoodTypes: number[];
  selectedPriceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  selectedDishDietTypes?: string[];
  selectedCustomTags?: string[];
  selectedSpiceLevels?: number[];
  isOpenNow?: boolean;
  isHighRated?: boolean;
  isBudgetFriendly?: boolean;
  onClearFilter: (type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'dishDiet' | 'customTags' | 'spice' | 'openNow' | 'highRated' | 'budgetFriendly' | 'all', id?: number) => void;
  onPriceRangeChange?: (ranges: string[]) => void;
  onEstablishmentTypeChange?: (types: number[]) => void;
  onDietTypeChange?: (types: number[]) => void;
  onDishDietTypeChange?: (types: string[]) => void;
  onCustomTagsChange?: (tags: string[]) => void;
  onSpiceLevelChange?: (levels: number[]) => void;
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
  selectedDishDietTypes = [],
  selectedCustomTags = [],
  selectedSpiceLevels = [],
  isOpenNow = false,
  isHighRated = false,
  isBudgetFriendly = false,
  onClearFilter,
  onPriceRangeChange = () => {},
  onEstablishmentTypeChange = () => {},
  onDietTypeChange = () => {},
  onDishDietTypeChange = () => {},
  onCustomTagsChange = () => {},
  onSpiceLevelChange = () => {},
  onOpenNowChange = () => {},
  onHighRatedChange = () => {},
  onBudgetFriendlyChange = () => {}
}: FilterTagsProps) {
  const isMobile = useIsMobile();
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  const { establishmentTypes } = useEstablishmentTypes();
  
  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedEstablishmentTypes.length > 0 || 
    (activeTab === 'restaurants' ? selectedDietTypes.length > 0 : selectedDishDietTypes.length > 0) ||
    selectedCustomTags.length > 0 ||
    selectedSpiceLevels.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly;

  // Helper function to get the next price sort state for dishes - start with descending
  const getNextPriceSortState = (currentRanges: string[]): string[] => {
    if (currentRanges.length === 0) {
      return ['price_desc']; // Start with descending (arrow down)
    } else if (currentRanges.includes('price_desc')) {
      return ['price_asc']; // Switch to ascending (arrow up)
    } else if (currentRanges.includes('price_asc')) {
      return []; // Clear sorting
    } else {
      return ['price_desc']; // Fallback to descending
    }
  };

  // Helper function to get price button text and icon for dishes
  const getPriceButtonContent = () => {
    if (selectedPriceRanges.includes('price_desc')) {
      return { text: 'Precio', icon: ArrowDown };
    } else if (selectedPriceRanges.includes('price_asc')) {
      return { text: 'Precio', icon: ArrowUp };
    } else {
      return { text: 'Precio', icon: ArrowDown }; // Default shows arrow down
    }
  };

  // Handle price button click for dishes (toggle behavior)
  const handleDishPriceClick = () => {
    const nextState = getNextPriceSortState(selectedPriceRanges);
    onPriceRangeChange(nextState);
  };

  const getFilterIcon = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return Euro;
      case 'establishment': return Store;
      case 'diet': return Utensils;
      case 'customTags': return Tags;
      case 'spice': return Flame;
      default: return null;
    }
  };

  const getFilterTitle = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return activeTab === 'dishes' ? 'Ordenar por Precio' : 'Precio';
      case 'establishment': return 'Tipo de Comercio';
      case 'diet': return 'Dieta';
      case 'customTags': return 'Etiquetas';
      case 'spice': return 'Picante';
      default: return 'Filtro';
    }
  };

  const getFilterCount = (filterKey: string) => {
    switch (filterKey) {
      case 'price': return selectedPriceRanges.length;
      case 'establishment': return selectedEstablishmentTypes.length;
      case 'diet': return activeTab === 'restaurants' ? selectedDietTypes.length : selectedDishDietTypes.length;
      case 'customTags': return selectedCustomTags.length;
      case 'spice': return selectedSpiceLevels.length;
      default: return 0;
    }
  };

  const isFilterActive = (filterKey: string) => {
    return getFilterCount(filterKey) > 0;
  };

  const getFilterContent = (filterKey: string) => {
    switch (filterKey) {
      case 'price':
        if (activeTab === 'dishes') {
          return (
            <div className="[&_label]:text-base space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="price-asc"
                    name="price-sort"
                    value="price_asc"
                    checked={selectedPriceRanges.includes('price_asc')}
                    onChange={() => {
                      if (selectedPriceRanges.includes('price_asc')) {
                        onPriceRangeChange([]);
                      } else {
                        onPriceRangeChange(['price_asc']);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="price-asc" className="text-sm font-medium">
                    Precio: Menor a Mayor
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="price-desc"
                    name="price-sort"
                    value="price_desc"
                    checked={selectedPriceRanges.includes('price_desc')}
                    onChange={() => {
                      if (selectedPriceRanges.includes('price_desc')) {
                        onPriceRangeChange([]);
                      } else {
                        onPriceRangeChange(['price_desc']);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="price-desc" className="text-sm font-medium">
                    Precio: Mayor a Menor
                  </label>
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div className="[&_label]:text-base space-y-4">
              <PriceFilter
                selectedPriceRanges={selectedPriceRanges}
                onPriceRangeChange={onPriceRangeChange}
              />
            </div>
          );
        }
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
            {activeTab === 'restaurants' ? (
              <DietFilter
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={onDietTypeChange}
              />
            ) : (
              <DishDietFilter
                selectedDishDietTypes={selectedDishDietTypes}
                onDishDietTypeChange={onDishDietTypeChange}
              />
            )}
          </div>
        );
      case 'customTags':
        return (
          <div className="[&_label]:text-base space-y-4">
            <CustomTagsFilter
              selectedCustomTags={selectedCustomTags}
              onCustomTagsChange={onCustomTagsChange}
            />
          </div>
        );
      case 'spice':
        return (
          <div className="[&_label]:text-base space-y-4">
            <SpiceFilter
              selectedSpiceLevels={selectedSpiceLevels}
              onSpiceLevelChange={onSpiceLevelChange}
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
    { key: 'price', label: activeTab === 'dishes' ? 'Precio' : 'Precio' },
    { key: 'establishment', label: 'Tipo' },
    { key: 'diet', label: 'Dieta' },
    ...(activeTab === 'dishes' ? [
      { key: 'spice', label: 'Picante' },
      { key: 'customTags', label: 'Etiquetas' }
    ] : []),
  ];

  const FilterTrigger = ({ children, filterKey }: { children: React.ReactNode, filterKey: string }) => {
    const handleOpenChange = (open: boolean) => {
      setActiveFilterModal(open ? filterKey : null);
    };

    const FilterIcon = getFilterIcon(filterKey);
    const isActive = isFilterActive(filterKey);
    const count = getFilterCount(filterKey);

    // Special handling for price filter in dishes tab
    if (filterKey === 'price' && activeTab === 'dishes') {
      const priceContent = getPriceButtonContent();
      const PriceIcon = priceContent.icon;
      
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
          onClick={handleDishPriceClick}
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
          <PriceIcon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-black'}`} />
          {priceContent.text}
        </Button>
      );
    }

    // Regular filter trigger with modal
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
            Top
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

          {/* Budget Friendly Quick Filter Button - Only show for restaurants tab */}
          {activeTab === 'restaurants' && (
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
          )}

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
