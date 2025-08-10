
import { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal-wrapper';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import FiltersSidebar from './FiltersSidebar';

interface FiltersModalProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
  selectedRatings: number[];
  onRatingChange: (ratings: number[]) => void;
  selectedEstablishments: number[];
  onEstablishmentChange: (establishments: number[]) => void;
  selectedServices: number[];
  onServiceChange: (services: number[]) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
  selectedTimeRanges: number[];
  onTimeRangeChange: (timeRanges: number[]) => void;
  selectedDietTypes: string[];
  onDietTypeChange: (dietTypes: string[]) => void;
}

export default function FiltersModal({
  selectedDistances,
  onDistanceChange,
  selectedRatings,
  onRatingChange,
  selectedEstablishments,
  onEstablishmentChange,
  selectedServices,
  onServiceChange,
  selectedPriceRanges,
  onPriceRangeChange,
  selectedTimeRanges,
  onTimeRangeChange,
  selectedDietTypes,
  onDietTypeChange,
}: FiltersModalProps) {
  const [open, setOpen] = useState(false);

  const clearAllFilters = () => {
    onDistanceChange([]);
    onRatingChange([]);
    onEstablishmentChange([]);
    onServiceChange([]);
    onPriceRangeChange([]);
    onTimeRangeChange([]);
    onDietTypeChange([]);
  };

  const hasActiveFilters = 
    selectedDistances.length > 0 ||
    selectedRatings.length > 0 ||
    selectedEstablishments.length > 0 ||
    selectedServices.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedTimeRanges.length > 0 ||
    selectedDietTypes.length > 0;

  return (
    <ModalWrapper open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button
          variant="ghost"
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 p-0 flex items-center justify-center relative group"
        >
          <SlidersHorizontal className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </ModalTrigger>
      
      <ModalContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        {/* Modern Header with gradient */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
          <ModalHeader>
            <div className="flex items-center justify-between">
              <ModalTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                Filtros de Búsqueda
              </ModalTitle>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-white hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpiar todo
                </Button>
              )}
            </div>
            
            {hasActiveFilters && (
              <p className="text-red-100 text-sm mt-2">
                Tienes filtros activos. Ajústalos para refinar tu búsqueda.
              </p>
            )}
          </ModalHeader>
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-b from-gray-50/50 to-white">
          <ScrollArea className="h-[60vh]">
            <div className="p-6">
              <FiltersSidebar
                selectedDistances={selectedDistances}
                onDistanceChange={onDistanceChange}
                selectedRatings={selectedRatings}
                onRatingChange={onRatingChange}
                selectedEstablishments={selectedEstablishments}
                onEstablishmentChange={onEstablishmentChange}
                selectedServices={selectedServices}
                onServiceChange={onServiceChange}
                selectedPriceRanges={selectedPriceRanges}
                onPriceRangeChange={onPriceRangeChange}
                selectedTimeRanges={selectedTimeRanges}
                onTimeRangeChange={onTimeRangeChange}
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={onDietTypeChange}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Modern Footer */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <span className="text-red-600 font-medium">
                  Filtros aplicados - Refinando resultados
                </span>
              ) : (
                "Selecciona filtros para personalizar tu búsqueda"
              )}
            </div>
            
            <Button
              onClick={() => setOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}
