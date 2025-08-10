
import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal-wrapper';
import FiltersSidebar from './FiltersSidebar';
import { Badge } from '@/components/ui/badge';

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

  // Calcular el total de filtros activos
  const totalActiveFilters = 
    selectedDistances.length +
    selectedRatings.length +
    selectedEstablishments.length +
    selectedServices.length +
    selectedPriceRanges.length +
    selectedTimeRanges.length +
    selectedDietTypes.length;

  return (
    <ModalWrapper open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <div className="relative h-10 w-10 flex items-center justify-center">
          <Button
            variant="ghost"
            className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white hover:text-white p-0 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
          {totalActiveFilters > 0 && (
            <Badge 
              variant="secondary" 
              className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
            >
              {totalActiveFilters}
            </Badge>
          )}
        </div>
      </ModalTrigger>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </ModalTitle>
        </ModalHeader>
        <div className="py-4">
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
      </ModalContent>
    </ModalWrapper>
  );
}
