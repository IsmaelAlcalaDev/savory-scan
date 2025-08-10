
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { Skeleton } from '@/components/ui/skeleton';

interface CuisineFilterProps {
  selectedCuisines: number[];
  onCuisineChange: (cuisines: number[]) => void;
}

export default function CuisineFilter({ selectedCuisines, onCuisineChange }: CuisineFilterProps) {
  const { cuisineTypes, loading, error } = useCuisineTypes();

  console.log('CuisineFilter state:', { cuisineTypes, loading, error, selectedCuisines });

  const handleCuisineToggle = (cuisineId: number) => {
    const newSelected = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(id => id !== cuisineId)
      : [...selectedCuisines, cuisineId];
    console.log('Cuisine selection changed:', newSelected);
    onCuisineChange(newSelected);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading cuisine types:', error);
    return (
      <div className="text-sm text-destructive p-2">
        Error cargando tipos de cocina: {error}
      </div>
    );
  }

  if (!cuisineTypes || cuisineTypes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">
        No hay tipos de cocina disponibles
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cuisineTypes.map((cuisine) => (
        <div
          key={cuisine.id}
          className={`cursor-pointer rounded-lg p-3 transition-all duration-200 text-center ${
            selectedCuisines.includes(cuisine.id)
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
          }`}
          onClick={() => handleCuisineToggle(cuisine.id)}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">
              {cuisine.icon_emoji || cuisine.icon || '🍽️'}
            </div>
            <span className="text-sm font-medium leading-tight">
              {cuisine.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
