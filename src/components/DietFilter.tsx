
import { Checkbox } from '@/components/ui/checkbox';
import { useDietTypes } from '@/hooks/useDietTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface DietFilterProps {
  selectedDietTypes: number[];
  onDietTypeChange: (types: number[]) => void;
}

export default function DietFilter({ selectedDietTypes, onDietTypeChange }: DietFilterProps) {
  const { dietCategories, loading, error } = useDietTypes();

  const handleDietToggle = (dietId: number) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2 ml-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading diet types:', error);
    return null;
  }

  return (
    <div className="space-y-4">
      {dietCategories.map((category, categoryIndex) => (
        <div key={category.category} className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">{category.displayName}</h4>
          <div className="space-y-2 ml-2">
            {category.options.map((diet) => (
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
          {categoryIndex < dietCategories.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}
    </div>
  );
}
