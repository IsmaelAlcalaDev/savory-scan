import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, ChefHat } from 'lucide-react';
import { DishFavoriteButton } from './DishFavoriteButton';
import { useNavigate } from 'react-router-dom';

interface AllDishCardProps {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isHealthy?: boolean;
  prepTimeMinutes?: number;
  servingSize?: number;
  restaurantName: string;
  restaurantSlug: string;
  rating?: number;
  category?: string;
  spiceLevel?: number;
  allergens?: string[];
}

export default function AllDishCard({
  id,
  name,
  description,
  price,
  imageUrl,
  isVegetarian,
  isVegan,
  isGlutenFree,
  isHealthy,
  prepTimeMinutes,
  servingSize,
  restaurantName,
  restaurantSlug,
  rating,
  category,
  spiceLevel,
  allergens
}: AllDishCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-secondary shadow-md hover:shadow-lg transition-shadow duration-200">
      {imageUrl && (
        <div className="relative w-full h-48 overflow-hidden rounded-md">
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
          <DishFavoriteButton dishId={id} />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{description || 'No description available'}</p>
        <div className="flex items-center space-x-2 mt-3">
          <Badge variant="secondary">
            {price.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
              minimumFractionDigits: 0,
            })}
          </Badge>
          {isVegetarian && <Badge>Vegetariano</Badge>}
          {isVegan && <Badge>Vegano</Badge>}
          {isGlutenFree && <Badge>Sin Gluten</Badge>}
          {isHealthy && <Badge>Saludable</Badge>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {allergens && allergens.length > 0 && (
            <div className="flex items-center text-xs text-red-500">
              Alergenos: {allergens.join(', ')}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            {rating !== null && rating !== undefined && (
              <>
                <Star className="h-4 w-4 mr-1" />
                <span>{rating?.toFixed(1) || 'Sin calificar'}</span>
              </>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            {prepTimeMinutes !== null && prepTimeMinutes !== undefined && (
              <>
                <Clock className="h-4 w-4 mr-1" />
                <span>{prepTimeMinutes} min</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate(`/restaurants/${restaurantSlug}/dishes/${id}`)}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Ver detalles
        </button>
      </CardContent>
    </Card>
  );
}
