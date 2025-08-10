
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
      <div className="w-full overflow-hidden">
        <div className="flex gap-3 pb-3 px-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
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
    <div className="w-full">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3 px-1" style={{ width: 'max-content' }}>
          {cuisineTypes.map((cuisine) => (
            <Badge
              key={cuisine.id}
              variant={selectedCuisines.includes(cuisine.id) ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap hover:bg-primary/90 transition-colors flex items-center gap-2 py-2 px-4 text-sm font-medium flex-shrink-0"
              onClick={() => handleCuisineToggle(cuisine.id)}
            >
              {cuisine.icon && (
                <span className="text-lg" role="img" aria-label={cuisine.name}>
                  {cuisine.icon}
                </span>
              )}
              <span>{cuisine.name}</span>
            </Badge>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
