
import RestaurantDietFilter from './RestaurantDietFilter';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
  selectedDietCategories?: string[];
  onDietCategoryChange?: (categories: string[]) => void;
  useSimpleMode?: boolean;
}

export default function DietFilter({ 
  selectedDietTypes,
  onDietTypeChange,
  selectedDietCategories = [],
  onDietCategoryChange = () => {},
  useSimpleMode = false
}: DietFilterProps) {
  // Use the new RestaurantDietFilter for restaurant filtering
  return (
    <RestaurantDietFilter
      selectedDietTypes={selectedDietTypes}
      onDietTypeChange={onDietTypeChange}
    />
  );
}
