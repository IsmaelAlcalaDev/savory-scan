
import { AllDishCard } from './AllDishCard';
import { Skeleton } from '@/components/ui/skeleton';

interface DishData {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  category_name?: string;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_google_rating?: number;
  distance_km?: number;
  formatted_price: string;
}

interface DishesGridProps {
  dishes: DishData[];
  loading: boolean;
  error: string | null;
}

export default function DishesGrid({ dishes, loading, error }: DishesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">Error al cargar platos: {error}</p>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">No se encontraron platos</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta cambiar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {dishes.map((dish) => (
        <AllDishCard
          key={dish.id}
          id={dish.id}
          name={dish.name}
          description={dish.description}
          basePrice={dish.base_price}
          imageUrl={dish.image_url}
          categoryName={dish.category_name}
          restaurantName={dish.restaurant_name}
          restaurantSlug={dish.restaurant_slug}
          restaurantRating={dish.restaurant_google_rating}
          distance={dish.distance_km}
          formattedPrice={dish.formatted_price}
        />
      ))}
    </div>
  );
}
