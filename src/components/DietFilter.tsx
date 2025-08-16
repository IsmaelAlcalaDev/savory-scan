
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

  console.log('DietFilter render - loading:', loading, 'error:', error, 'categories:', dietCategories);

  const handleDietToggle = (dietId: number) => {
    const newSelected = selectedDietTypes.includes(dietId)
      ? selectedDietTypes.filter(id => id !== dietId)
      : [...selectedDietTypes, dietId];
    onDietTypeChange(newSelected);
  };

  if (loading) {
    console.log('DietFilter: Showing loading skeleton');
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
    console.error('DietFilter: Error loading diet types:', error);
    return (
      <div className="text-red-500 text-sm p-4 border border-red-200 rounded-md">
        Error al cargar los filtros de dieta: {error}
      </div>
    );
  }

  if (!dietCategories || dietCategories.length === 0) {
    console.log('DietFilter: No diet categories found');
    return (
      <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded-md">
        No se encontraron filtros de dieta disponibles.
      </div>
    );
  }

  console.log('DietFilter: Rendering', dietCategories.length, 'categories');

  return (
    <div className="space-y-4">
      {dietCategories.map((category, categoryIndex) => (
        <div key={category.category} className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">{category.displayName}</h4>
          <div className="space-y-3 ml-2">
            {category.options.map((diet) => (
              <div key={diet.id} className="flex items-start space-x-3">
                <Checkbox 
                  id={`diet-${diet.id}`}
                  checked={selectedDietTypes.includes(diet.id)}
                  onCheckedChange={() => handleDietToggle(diet.id)}
                  className="mt-0.5"
                />
                <label 
                  htmlFor={`diet-${diet.id}`}
                  className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-start gap-2 flex-1"
                >
                  {diet.icon && <span className="text-base">{diet.icon}</span>}
                  <span className="flex-1">{diet.name}</span>
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
