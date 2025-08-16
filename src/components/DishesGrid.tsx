import { useDishes } from '@/hooks/useDishes';
import { DishCard } from './DishCard';
import { Skeleton } from '@/components/ui/skeleton';

interface DishesGridProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  selectedDietTypes?: string[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  selectedCustomTags?: string[];
  selectedAllergens?: string[];
}

export default function DishesGrid({
  searchQuery,
  userLat,
  userLng,
  selectedDietTypes,
  selectedPriceRanges,
  selectedFoodTypes,
  selectedCustomTags,
  selectedAllergens
}: DishesGridProps) {
  const { dishes, loading, error } = useDishes({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCustomTags,
    selectedAllergens
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error: {error}</div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="text-gray-500">No se encontraron platos con los filtros seleccionados.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {dishes.map((dish) => (
        <DishCard key={dish.id} dish={dish} />
      ))}
    </div>
  );
}
