
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
}

interface RestaurantGridProps {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

export default function RestaurantGrid({ restaurants, loading, error }: RestaurantGridProps) {
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
        <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
      </div>
    );
  }

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
        <RestaurantCard
          key={restaurant.id}
          id={restaurant.id}
          name={restaurant.name}
          slug={restaurant.slug}
          description={restaurant.description}
          priceRange={restaurant.price_range}
          rating={restaurant.google_rating}
          distance={restaurant.distance_km}
          cuisineTypes={restaurant.cuisine_types}
          establishmentType={restaurant.establishment_type}
          services={restaurant.services}
          favoritesCount={restaurant.favorites_count}
          coverImageUrl={restaurant.cover_image_url}
          logoUrl={restaurant.logo_url}
        />
      ))}
    </div>
  );
}
