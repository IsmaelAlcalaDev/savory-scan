
import { MapPin, Star, Building2, Utensils, DollarSign, Clock, Leaf } from 'lucide-react';
import FilterTag from './FilterTag';
import DistanceFilter from './DistanceFilter';
import RatingFilter from './RatingFilter';
import EstablishmentFilter from './EstablishmentFilter';
import ServiceFilter from './ServiceFilter';
import PriceRangeFilter from './PriceRangeFilter';
import TimeRangeFilter from './TimeRangeFilter';
import DietTypeFilter from './DietTypeFilter';

interface RestaurantFilterTagsProps {
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

export default function RestaurantFilterTags({
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
}: RestaurantFilterTagsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <FilterTag
        label="Distancia"
        icon={<MapPin className="h-4 w-4" />}
        activeCount={selectedDistances.length}
        onClear={() => onDistanceChange([])}
      >
        <DistanceFilter
          selectedDistances={selectedDistances}
          onDistanceChange={onDistanceChange}
        />
      </FilterTag>

      <FilterTag
        label="Valoración"
        icon={<Star className="h-4 w-4" />}
        activeCount={selectedRatings.length}
        onClear={() => onRatingChange([])}
      >
        <RatingFilter
          selectedRatings={selectedRatings}
          onRatingChange={onRatingChange}
        />
      </FilterTag>

      <FilterTag
        label="Tipo"
        icon={<Building2 className="h-4 w-4" />}
        activeCount={selectedEstablishments.length}
        onClear={() => onEstablishmentChange([])}
      >
        <EstablishmentFilter
          selectedEstablishments={selectedEstablishments}
          onEstablishmentChange={onEstablishmentChange}
        />
      </FilterTag>

      <FilterTag
        label="Servicios"
        icon={<Utensils className="h-4 w-4" />}
        activeCount={selectedServices.length}
        onClear={() => onServiceChange([])}
      >
        <ServiceFilter
          selectedServices={selectedServices}
          onServiceChange={onServiceChange}
        />
      </FilterTag>

      <FilterTag
        label="Precio"
        icon={<DollarSign className="h-4 w-4" />}
        activeCount={selectedPriceRanges.length}
        onClear={() => onPriceRangeChange([])}
      >
        <PriceRangeFilter
          selectedPriceRanges={selectedPriceRanges}
          onPriceRangeChange={onPriceRangeChange}
        />
      </FilterTag>

      <FilterTag
        label="Horario"
        icon={<Clock className="h-4 w-4" />}
        activeCount={selectedTimeRanges.length}
        onClear={() => onTimeRangeChange([])}
      >
        <TimeRangeFilter
          selectedTimeRanges={selectedTimeRanges}
          onTimeRangeChange={onTimeRangeChange}
        />
      </FilterTag>

      <FilterTag
        label="Dieta"
        icon={<Leaf className="h-4 w-4" />}
        activeCount={selectedDietTypes.length}
        onClear={() => onDietTypeChange([])}
      >
        <DietTypeFilter
          selectedDietTypes={selectedDietTypes}
          onDietTypeChange={onDietTypeChange}
        />
      </FilterTag>
    </div>
  );
}
