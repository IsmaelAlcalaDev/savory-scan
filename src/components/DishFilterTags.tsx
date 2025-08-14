
import { MapPin, DollarSign, Leaf, Flame, Clock } from 'lucide-react';
import FilterTag from './FilterTag';
import DistanceFilter from './DistanceFilter';
import PriceRangeFilter from './PriceRangeFilter';
import DietTypeFilter from './DietTypeFilter';
import SpiceLevelFilter from './SpiceLevelFilter';
import PrepTimeFilter from './PrepTimeFilter';

interface DishFilterTagsProps {
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

export default function DishFilterTags({
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
}: DishFilterTagsProps) {
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

      <FilterTag
        label="Picante"
        icon={<Flame className="h-4 w-4" />}
        activeCount={selectedSpiceLevels.length}
        onClear={() => onSpiceLevelChange([])}
      >
        <SpiceLevelFilter
          selectedSpiceLevels={selectedSpiceLevels}
          onSpiceLevelChange={onSpiceLevelChange}
        />
      </FilterTag>

      <FilterTag
        label="Tiempo"
        icon={<Clock className="h-4 w-4" />}
        activeCount={selectedPrepTimeRanges.length}
        onClear={() => onPrepTimeRangeChange([])}
      >
        <PrepTimeFilter
          selectedPrepTimeRanges={selectedPrepTimeRanges}
          onPrepTimeRangeChange={onPrepTimeRangeChange}
        />
      </FilterTag>
    </div>
  );
}
