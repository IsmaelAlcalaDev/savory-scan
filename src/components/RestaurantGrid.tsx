
import { Skeleton } from '@/components/ui/skeleton';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  google_rating?: number;
  distance_km?: number;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
}

export default function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  if (restaurants.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-muted-foreground">No se encontraron restaurantes</p>
        <p className="text-sm text-muted-foreground mt-2">
          Intenta cambiar los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-card rounded-lg overflow-hidden shadow-sm border">
          {restaurant.image_url && (
            <img 
              src={restaurant.image_url} 
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{restaurant.name}</h3>
            {restaurant.description && (
              <p className="text-muted-foreground text-sm mb-2">{restaurant.description}</p>
            )}
            <div className="flex items-center justify-between">
              {restaurant.google_rating && (
                <span className="text-sm text-muted-foreground">
                  ⭐ {restaurant.google_rating}
                </span>
              )}
              {restaurant.distance_km && (
                <span className="text-sm text-muted-foreground">
                  {restaurant.distance_km.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
