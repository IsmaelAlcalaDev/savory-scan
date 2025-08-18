import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Heart } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { FavoriteButton } from './FavoriteButton';
import { useNavigate } from 'react-router-dom';

interface RestaurantCardProps {
  id: number;
  name: string;
  description?: string;
  coverImageUrl?: string;
  cuisineTypes: string[];
  priceRange: string;
  googleRating?: number;
  distance?: number | null;
  establishmentType?: string;
  slug: string;
  favoritesCount?: number;
}

export default function RestaurantCard({
  id,
  name,
  description,
  coverImageUrl,
  cuisineTypes,
  priceRange,
  googleRating,
  distance,
  establishmentType,
  slug,
  favoritesCount = 0
}: RestaurantCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/restaurants/${slug}`);
  };

  const roundedDistance = distance !== null ? distance?.toFixed(1) : null;

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-4">
          <div className="relative w-full h-48 rounded-md overflow-hidden cursor-pointer" onClick={handleCardClick}>
            <OptimizedImage
              src={coverImageUrl || "/placeholder.png"}
              alt={name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute top-2 left-2">
              {cuisineTypes.map((type, index) => (
                <Badge key={index} variant="secondary" className="mr-1">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold line-clamp-1 cursor-pointer hover:underline" onClick={handleCardClick}>
              {name}
            </h3>
            <FavoriteButton restaurantId={id} initialFavoritesCount={favoritesCount} />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description || 'No description available'}</p>
          <div className="flex items-center space-x-2">
            {googleRating && (
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                <span>{googleRating.toFixed(1)}</span>
              </div>
            )}
            {establishmentType && (
              <Badge variant="outline">{establishmentType}</Badge>
            )}
          </div>
        </CardContent>
      </div>
      <div className="mt-auto border-t py-2 px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {/* TODO: Implementar horarios */}
            <span>Abre a las 12:00</span>
          </div>
          <div className="flex items-center">
            {roundedDistance !== null && (
              <>
                <MapPin className="h-4 w-4 mr-1" />
                <span>{roundedDistance} km</span>
              </>
            )}
            {!roundedDistance && (
              <>
                <MapPin className="h-4 w-4 mr-1" />
                <span>No disponible</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
