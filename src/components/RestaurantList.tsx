
import { Loader2, MapPin, Star, Clock } from 'lucide-react';
import RestaurantCard from './RestaurantCard';

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
  loading: boolean;
  error: string | null;
}

export default function RestaurantList({ restaurants, loading, error }: RestaurantListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando restaurantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-destructive font-medium mb-2">Error al cargar restaurantes</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium mb-2">No se encontraron restaurantes</p>
          <p className="text-sm text-muted-foreground">
            Intenta ajustar tus filtros o buscar en otra ubicación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} encontrado{restaurants.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid gap-4">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </div>
  );
}
