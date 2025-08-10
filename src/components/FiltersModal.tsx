
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
      
      <ModalContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header fijo */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex-shrink-0 relative">
          {/* Botón de cerrar más grande y blanco */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="h-8 w-8 text-white font-bold" strokeWidth={4} />
          </button>

          <ModalHeader>
            <div className="flex items-center justify-between pr-16">
              <ModalTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                Filtros de Búsqueda
              </ModalTitle>
            </div>
            
            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-red-100 text-sm">
                  Tienes filtros activos. Los cambios se aplican automáticamente.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-white hover:bg-white/20 transition-colors flex items-center gap-2 bg-white/10 px-4 py-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            )}

            {!hasActiveFilters && (
              <p className="text-red-100 text-sm mt-2">
                Selecciona los filtros que desees para refinar tu búsqueda.
              </p>
            )}
          </ModalHeader>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
          <ScrollArea className="h-full">
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

        {/* Footer fijo con botón de limpiar alternativo */}
        {hasActiveFilters && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-6 py-2"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar Todos los Filtros
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </ModalWrapper>
  );
}
