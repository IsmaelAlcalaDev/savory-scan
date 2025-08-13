
import { Loader2 } from 'lucide-react';

interface DishData {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
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
  restaurant_latitude: number;
  restaurant_longitude: number;
  restaurant_price_range: string;
  restaurant_google_rating?: number;
  distance_km?: number;
  formatted_price: string;
}

interface DishListProps {
  dishes: DishData[];
  isLoading: boolean;
  error: string | null;
}

export default function DishList({ dishes, isLoading, error }: DishListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Cargando platos...</span>
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

  if (dishes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron platos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {dishes.map((dish) => (
        <div key={dish.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {dish.image_url && (
            <img 
              src={dish.image_url} 
              alt={dish.image_alt || dish.name}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{dish.name}</h3>
            {dish.description && (
              <p className="text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-primary font-semibold text-lg">{dish.formatted_price}</span>
              {dish.is_featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Destacado
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">En {dish.restaurant_name}</p>
            {dish.distance_km && (
              <p className="text-sm text-gray-500">
                {dish.distance_km.toFixed(1)} km
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {dish.is_vegetarian && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Vegetariano
                </span>
              )}
              {dish.is_vegan && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Vegano
                </span>
              )}
              {dish.is_gluten_free && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Sin Gluten
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
