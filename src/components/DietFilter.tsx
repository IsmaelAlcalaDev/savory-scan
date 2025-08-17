
import SimpleDietFilter from './SimpleDietFilter';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
  selectedDietCategories?: string[];
  onDietCategoryChange?: (categories: string[]) => void;
  useSimpleMode?: boolean;
}

export default function DietFilter({ 
  selectedDietCategories = [],
  onDietCategoryChange = () => {},
  useSimpleMode = true
}: DietFilterProps) {
  // Always use SimpleDietFilter since we removed the complex diet filtering
  return (
    <SimpleDietFilter
      selectedDietCategories={selectedDietCategories}
      onDietCategoryChange={onDietCategoryChange}
    />
  );
}
