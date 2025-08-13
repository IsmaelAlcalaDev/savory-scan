
import { Loader2, Utensils, ChefHat } from 'lucide-react';
import DishCard from './DishCard';

interface DishData {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_healthy: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  favorites_count: number;
  category_name?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  distance_km?: number;
  formatted_price: string;
}

interface DishListProps {
  dishes: DishData[];
  loading: boolean;
  error: string | null;
}

export default function DishList({ dishes, loading, error }: DishListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando platos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-destructive font-medium mb-2">Error al cargar platos</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium mb-2">No se encontraron platos</p>
          <p className="text-sm text-muted-foreground">
            Intenta ajustar tus filtros o buscar otros términos
          </p>
        </div>
      </div>
    );
  }

  // Transform DishData to the format expected by DishCard
  const transformedDishes = dishes.map(dish => ({
    ...dish,
    price: dish.base_price,
    restaurant: {
      id: dish.restaurant_id,
      name: dish.restaurant_name,
      slug: dish.restaurant_slug
    }
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {dishes.length} plato{dishes.length !== 1 ? 's' : ''} encontrado{dishes.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid gap-4">
        {transformedDishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={dish.restaurant_id}
          />
        ))}
      </div>
    </div>
  );
}
