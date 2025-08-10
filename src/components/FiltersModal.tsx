
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal-wrapper';
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

  return (
    <ModalWrapper open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild>
        <Button
          variant="ghost"
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white hover:text-white shadow-md hover:shadow-lg transition-all duration-200 border-0 p-0 flex items-center justify-center"
        >
          <SlidersHorizontal className="h-6 w-6" />
        </Button>
      </ModalTrigger>
      <ModalContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
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
