
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
  const { dishes, loading, error } = useRestaurantDishes(restaurantId);

  if (loading) {
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
    return (
      <Card className="bg-gradient-card border-glass shadow-card">
        <CardContent className="p-12 text-center">
          <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay platos disponibles</h3>
          <p className="text-muted-foreground">
            Este restaurante aún no tiene platos registrados en su carta.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          restaurantId={restaurantId}
          onDishClick={onDishClick}
        />
      ))}
    </div>
  );
}
