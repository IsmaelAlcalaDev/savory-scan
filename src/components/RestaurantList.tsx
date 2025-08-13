
import { Loader2 } from 'lucide-react';

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
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
}

export default function RestaurantList({ restaurants, isLoading, error }: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Cargando restaurantes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron restaurantes</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <div key={restaurant.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {restaurant.cover_image_url && (
            <img 
              src={restaurant.cover_image_url} 
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
            {restaurant.description && (
              <p className="text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-primary font-semibold">{restaurant.price_range}</span>
              {restaurant.google_rating && (
                <span className="text-yellow-500">★ {restaurant.google_rating}</span>
              )}
            </div>
            {restaurant.distance_km && (
              <p className="text-sm text-gray-500 mt-1">
                {restaurant.distance_km.toFixed(1)} km
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
