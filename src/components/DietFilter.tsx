
import SimpleDietFilter from './SimpleDietFilter';
import DietFilterWithPercentages from './DietFilterWithPercentages';

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
  useSimpleMode = true // Changed default to true
}: DietFilterProps) {
  // If simple mode is enabled, use the new SimpleDietFilter
  if (useSimpleMode) {
    return (
      <SimpleDietFilter
        selectedDietCategories={selectedDietCategories}
        onDietCategoryChange={onDietCategoryChange}
      />
    );
  }

  // Keep existing DietFilterWithPercentages for backward compatibility
  // This will be used in other parts of the app that still need the complex filtering
  return (
    <DietFilterWithPercentages
      selectedDietTypes={selectedDietTypes}
      onDietTypeChange={onDietTypeChange}
    />
  );
}
