
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
        <Button
          variant="outline"
          className="h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border flex items-center gap-2 whitespace-nowrap flex-shrink-0"
        >
          <Filter className="h-3 w-3" />
          Filtros
          {totalActiveFilters > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground font-medium ml-1">
              {totalActiveFilters}
            </Badge>
          )}
        </Button>
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
