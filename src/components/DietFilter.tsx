
import { Checkbox } from '@/components/ui/checkbox';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilter({ selectedDietTypes, onDietTypeChange }: DietFilterProps) {
  const { dietTypes, loading, error } = useDietTypes();

  const handleDietToggle = (dietId: number) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading diet types:', error);
    return null;
  }

  return (
    <div className="space-y-3">
      {dietTypes.map((diet) => (
        <div key={diet.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`diet-${diet.id}`}
            checked={selectedDietTypes.includes(diet.id)}
            onCheckedChange={() => handleDietToggle(diet.id)}
          />
          <label 
            htmlFor={`diet-${diet.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
          >
            {diet.icon && <span>{diet.icon}</span>}
            {diet.name}
          </label>
        </div>
      ))}
    </div>
  );
}
