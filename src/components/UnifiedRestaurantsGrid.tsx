
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services?: string[];
  favorites_count?: number;
  cover_image_url?: string;
  logo_url?: string;
}

interface UnifiedRestaurantsGridProps {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

export default function UnifiedRestaurantsGrid({
  restaurants,
  loading,
  error
}: UnifiedRestaurantsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error al cargar restaurantes</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No hay restaurantes disponibles</h3>
        <p className="text-muted-foreground">
          Intenta ajustar tus filtros o buscar en una zona diferente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          id={restaurant.id}
          name={restaurant.name}
          description={restaurant.description}
          coverImageUrl={restaurant.cover_image_url}
          cuisineTypes={restaurant.cuisine_types}
          priceRange={restaurant.price_range}
          googleRating={restaurant.google_rating}
          distance={restaurant.distance_km}
          establishmentType={restaurant.establishment_type}
          slug={restaurant.slug}
          favoritesCount={restaurant.favorites_count}
        />
      ))}
    </div>
  );
}
