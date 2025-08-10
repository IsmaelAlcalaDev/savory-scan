
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
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </ScrollArea>
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
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {cuisineTypes.map((cuisine) => (
          <Badge
            key={cuisine.id}
            variant={selectedCuisines.includes(cuisine.id) ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap hover:bg-primary/90 transition-colors"
            onClick={() => handleCuisineToggle(cuisine.id)}
          >
            {cuisine.icon && <span className="mr-1">{cuisine.icon}</span>}
            {cuisine.name}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
}
