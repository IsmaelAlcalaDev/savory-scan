
import { useDishes } from '@/hooks/useDishes';
import { useDishSort } from '@/hooks/useDishSort';
import { Skeleton } from '@/components/ui/skeleton';
import FilterTags, { ResetFiltersButton } from './FilterTags';
import DishCard from './DishCard';

interface DishesWithSortProps {
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
  selectedFoodTypes: number[];
  selectedDietTypes: number[];
  selectedCustomTags: string[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export default function DishesWithSort({
  searchQuery,
  userLocation,
  selectedFoodTypes,
  selectedDietTypes,
  selectedCustomTags,
  hasActiveFilters,
  onClearAll
}: DishesWithSortProps) {
  const { sortOptions, selectedSort, handleSortChange } = useDishSort();

  const {
    dishes,
    loading: dishesLoading,
    error: dishesError
  } = useDishes({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 1000,
    selectedFoodTypes,
    selectedDietTypes: selectedDietTypes.length > 0 ? selectedDietTypes : undefined,
    selectedCustomTags: selectedCustomTags.length > 0 ? selectedCustomTags : undefined,
    spiceLevels: [],
    sortBy: selectedSort
  });

  const getResultsText = (count: number, loading: boolean) => {
    if (loading) return 'Cargando...';
    
    if (userLocation) {
      return `${count} platos cerca de ti`;
    } else {
      return `${count} platos en España`;
    }
  };

  return (
    <>
      {/* Filter Tags with Sort */}
      <FilterTags 
        tags={[]}
        showSort={true}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between mb-3 mt-3">
        <div>
          <h2 className="text-sm font-medium mb-1 text-muted-foreground">
            {getResultsText(dishes.length, dishesLoading)}
          </h2>
          {dishesError && <p className="text-sm text-destructive mt-1">Error: {dishesError}</p>}
        </div>
        <ResetFiltersButton 
          hasActiveFilters={hasActiveFilters} 
          onClearAll={onClearAll} 
        />
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {dishesLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))
        ) : dishesError ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Error al cargar platos: {dishesError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Revisa la consola para más detalles
            </p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron platos</p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        ) : (
          dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
            />
          ))
        )}
      </div>
    </>
  );
}
