
import { useDishSort } from '@/hooks/useDishSort';
import { useDishes } from '@/hooks/useDishes';
import DishCard from './DishCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface DishesWithSortProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedDietTypes?: number[];
  selectedDishDietTypes?: string[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  selectedCustomTags?: string[];
  spiceLevels?: number[];
  onSortChange?: (sortBy: string) => void;
}

export default function DishesWithSort(props: DishesWithSortProps) {
  const { dishes, loading, error } = useDishes({
    searchQuery: props.searchQuery,
    userLat: props.userLat,
    userLng: props.userLng,
    maxDistance: props.maxDistance,
    selectedDietTypes: props.selectedDietTypes,
    selectedDishDietTypes: props.selectedDishDietTypes,
    selectedPriceRanges: props.selectedPriceRanges,
    selectedFoodTypes: props.selectedFoodTypes,
    selectedCustomTags: props.selectedCustomTags,
    spiceLevels: props.spiceLevels
  });

  const { sortedDishes } = useDishSort({ dishes });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar platos</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (sortedDishes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No hay platos disponibles</h3>
        <p className="text-muted-foreground">
          Intenta ajustar tus filtros o buscar en una zona diferente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {sortedDishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          restaurantId={dish.restaurant_id}
          expandedDishId={null}
          onExpandedChange={() => {}}
        />
      ))}
    </div>
  );
}
