
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Utensils } from 'lucide-react';
import DishCard from './DishCard';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useRestaurantDishes } from '@/hooks/useRestaurantDishes';

interface RestaurantDishesGridProps {
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

export default function RestaurantDishesGrid({ restaurantId, onDishClick }: RestaurantDishesGridProps) {
  console.log('RestaurantDishesGrid: Rendering with restaurantId:', restaurantId);
  
  const { dishes, loading, error } = useRestaurantDishes(restaurantId);

  console.log('RestaurantDishesGrid: Hook result:', { dishes: dishes.length, loading, error });

  if (loading) {
    console.log('RestaurantDishesGrid: Showing loading state');
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.log('RestaurantDishesGrid: Showing error state:', error);
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

  if (dishes.length === 0) {
    console.log('RestaurantDishesGrid: Showing empty state - no dishes found');
    return (
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardContent className="p-12 text-center">
          <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay platos disponibles</h3>
          <p className="text-muted-foreground">
            Este restaurante aún no tiene platos registrados en su carta.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Debug: Restaurant ID {restaurantId}, Dishes found: {dishes.length}
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('RestaurantDishesGrid: Rendering dishes grid with', dishes.length, 'dishes');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => {
        console.log('RestaurantDishesGrid: Rendering dish:', dish.name);
        return (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
            onDishClick={onDishClick}
          />
        );
      })}
    </div>
  );
}
