
import DietFilterWithPercentages from './DietFilterWithPercentages';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilter({ selectedDietTypes, onDietTypeChange }: DietFilterProps) {
  return (
    <DietFilterWithPercentages
      selectedDietTypes={selectedDietTypes}
      onDietTypeChange={onDietTypeChange}
    />
  );
}
