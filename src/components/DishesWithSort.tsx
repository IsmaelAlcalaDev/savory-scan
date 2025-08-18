
import { useState, useMemo } from 'react';
import { useDishes } from '@/hooks/useDishes';
import { useDishSort } from '@/hooks/useDishSort';
import DishCard from './DishCard';
import FilterTags from './FilterTags';
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
}

export default function DishesWithSort(props: DishesWithSortProps) {
  const { selectedSort, handleSortChange, sortOptions } = useDishSort();
  
  const { dishes, loading, error } = useDishes({
    ...props
  });

  // Ordenar platos según la opción seleccionada
  const sortedDishes = useMemo(() => {
    if (!dishes.length) return [];

    const sorted = [...dishes];
    
    switch (selectedSort) {
      case 'rating':
        // Por ahora ordenar por favoritos como proxy del rating
        return sorted.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        
      case 'popularity':
        return sorted.sort((a, b) => (b.favorites_count || 0) - (a.favorites_count || 0));
        
      case 'price_asc':
        return sorted.sort((a, b) => a.base_price - b.base_price);
        
      case 'price_desc':
        return sorted.sort((a, b) => b.base_price - a.base_price);
        
      default:
        return sorted;
    }
  }, [dishes, selectedSort]);

  // Crear etiquetas de filtro activos (simplificado por ahora)
  const filterTags = useMemo(() => {
    const tags = [];
    
    if (props.searchQuery) {
      tags.push({
        id: 'search',
        label: `"${props.searchQuery}"`,
        onRemove: () => {} // TODO: Implementar limpieza de búsqueda
      });
    }

    return tags;
  }, [props.searchQuery]);

  if (loading) {
    return (
      <div className="space-y-6">
        <FilterTags
          tags={filterTags}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          showSort={true}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <FilterTags
          tags={filterTags}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          showSort={true}
        />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar platos</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (sortedDishes.length === 0) {
    return (
      <div className="space-y-6">
        <FilterTags
          tags={filterTags}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          showSort={true}
        />
        
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No hay platos disponibles</h3>
          <p className="text-muted-foreground">
            Intenta ajustar tus filtros o buscar en una zona diferente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterTags
        tags={filterTags}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        showSort={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDishes.map((dish) => (
          <DishCard
            key={dish.id}
            id={dish.id}
            name={dish.name}
            description={dish.description}
            basePrice={dish.base_price}
            imageUrl={dish.image_url}
            imageAlt={dish.image_alt}
            isFeatured={dish.is_featured}
            isVegetarian={dish.is_vegetarian}
            isVegan={dish.is_vegan}
            isGlutenFree={dish.is_gluten_free}
            isHealthy={dish.is_healthy}
            spiceLevel={dish.spice_level}
            preparationTime={dish.preparation_time_minutes}
            favoritesCount={dish.favorites_count}
            categoryName={dish.category_name}
            restaurantId={dish.restaurant_id}
            restaurantName={dish.restaurant_name}
            restaurantSlug={dish.restaurant_slug}
            customTags={dish.custom_tags}
          />
        ))}
      </div>
    </div>
  );
}
