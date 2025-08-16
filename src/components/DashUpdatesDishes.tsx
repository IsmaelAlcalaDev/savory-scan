
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';
import DishSearchBar from '@/components/DishSearchBar';
import CuisineFilter from '@/components/CuisineFilter';
import PriceFilter from '@/components/PriceFilter';
import UpdatedUnifiedFiltersModal from '@/components/UpdatedUnifiedFiltersModal';
import PopularityQuickFilter from '@/components/PopularityQuickFilter';
import AllDishCard from '@/components/AllDishCard';
import { useUpdatedDishes } from '@/hooks/useUpdatedDishes';
import type { DishFilters } from '@/types/dishFilters';

export default function DashUpdatesDishes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedDietOptions, setSelectedDietOptions] = useState<{
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isHealthy?: boolean;
  }>({});
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [sortByPopularity, setSortByPopularity] = useState(false);

  const filters: DishFilters = {
    searchQuery,
    selectedPriceRanges,
    selectedFoodTypes,
    ...selectedDietOptions,
    selectedCustomTags,
    excludedAllergens,
    selectedSpiceLevels,
    sortByPopularity
  };

  const { dishes, loading, error } = useUpdatedDishes(filters);

  const handlePopularityToggle = () => {
    setSortByPopularity(!sortByPopularity);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardContent className="p-12 text-center">
          <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error al cargar platos</h3>
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <DishSearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <CuisineFilter
          selectedCuisines={selectedFoodTypes}
          onCuisineChange={setSelectedFoodTypes}
        />
        
        <div className="flex flex-wrap gap-3 items-center">
          <PriceFilter
            selectedPriceRanges={selectedPriceRanges}
            onPriceRangeChange={setSelectedPriceRanges}
          />
          
          <UpdatedUnifiedFiltersModal
            selectedPriceRanges={selectedPriceRanges}
            selectedFoodTypes={selectedFoodTypes}
            onPriceRangeChange={setSelectedPriceRanges}
            onFoodTypeChange={setSelectedFoodTypes}
            selectedDietOptions={selectedDietOptions}
            onDietOptionsChange={setSelectedDietOptions}
            selectedCustomTags={selectedCustomTags}
            onCustomTagsChange={setSelectedCustomTags}
            excludedAllergens={excludedAllergens}
            onAllergensChange={setExcludedAllergens}
            selectedSpiceLevels={selectedSpiceLevels}
            onSpiceLevelsChange={setSelectedSpiceLevels}
          />
          
          <PopularityQuickFilter
            isActive={sortByPopularity}
            onToggle={handlePopularityToggle}
          />
        </div>
      </div>
      
      {dishes.length === 0 ? (
        <Card className="bg-gradient-card border-glass shadow-card">
          <CardContent className="p-12 text-center">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron platos</h3>
            <p className="text-muted-foreground">
              Intenta ajustar tus filtros para encontrar más opciones.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <AllDishCard
              key={dish.id}
              dish={dish}
              showRestaurantInfo={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
