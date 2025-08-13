
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
import DishesFiltersSidebar from './DishesFiltersSidebar';

interface DishesFiltersModalProps {
  selectedDistances: number[];
  onDistanceChange: (distances: number[]) => void;
  selectedPriceRanges: string[];
  onPriceRangeChange: (priceRanges: string[]) => void;
  selectedDietTypes: string[];
  onDietTypeChange: (dietTypes: string[]) => void;
  selectedSpiceLevels: number[];
  onSpiceLevelChange: (spiceLevels: number[]) => void;
  selectedPrepTimeRanges: number[];
  onPrepTimeRangeChange: (prepTimeRanges: number[]) => void;
}

export default function DishesFiltersModal({
  selectedDistances,
  onDistanceChange,
  selectedPriceRanges,
  onPriceRangeChange,
  selectedDietTypes,
  onDietTypeChange,
  selectedSpiceLevels,
  onSpiceLevelChange,
  selectedPrepTimeRanges,
  onPrepTimeRangeChange,
}: DishesFiltersModalProps) {
  const [open, setOpen] = useState(false);

  const clearAllFilters = () => {
    onDistanceChange([]);
    onPriceRangeChange([]);
    onDietTypeChange([]);
    onSpiceLevelChange([]);
    onPrepTimeRangeChange([]);
  };

  const applyFilters = () => {
    setOpen(false);
  };

  const hasActiveFilters = 
    selectedDistances.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedDietTypes.length > 0 ||
    selectedSpiceLevels.length > 0 ||
    selectedPrepTimeRanges.length > 0;

  return (
    <ModalWrapper open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button
          variant="ghost"
          className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0 p-0 flex items-center justify-center relative group"
        >
          <SlidersHorizontal className="h-6 w-6 transition-transform duration-300 group-hover:rotate-180" />
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
          )}
        </Button>
      </ModalTrigger>
      
      <ModalContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header fijo */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-6 flex-shrink-0 relative">
          {/* Botón de cerrar */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="h-8 w-8 text-primary-foreground font-bold" strokeWidth={4} />
          </button>

          <ModalHeader>
            <div className="flex items-center justify-between pr-16">
              <ModalTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                Filtros de Platos
              </ModalTitle>
            </div>
            
            <p className="text-primary-foreground/90 text-sm mt-2">
              Selecciona los filtros que desees para refinar tu búsqueda de platos.
            </p>
          </ModalHeader>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          <ScrollArea className="h-full">
            <div className="p-6">
              <DishesFiltersSidebar
                selectedDistances={selectedDistances}
                onDistanceChange={onDistanceChange}
                selectedPriceRanges={selectedPriceRanges}
                onPriceRangeChange={onPriceRangeChange}
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={onDietTypeChange}
                selectedSpiceLevels={selectedSpiceLevels}
                onSpiceLevelChange={onSpiceLevelChange}
                selectedPrepTimeRanges={selectedPrepTimeRanges}
                onPrepTimeRangeChange={onPrepTimeRangeChange}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Footer fijo con botones de acción */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="px-6"
              >
                Cancelar
              </Button>
              <Button
                onClick={applyFilters}
                className="px-8 bg-primary hover:bg-primary/90"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}
