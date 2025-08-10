
import { Star, MapPin, Euro, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RestaurantCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priceRange: string;
  googleRating?: number;
  distance?: number;
  cuisineTypes: string[];
  establishmentType?: string;
  services?: string[];
  favoritesCount?: number;
  onClick?: () => void;
  className?: string;
}

export default function RestaurantCard({
  id,
  name,
  slug,
  description,
  priceRange,
  googleRating,
  distance,
  cuisineTypes,
  establishmentType,
  services = [],
  favoritesCount = 0,
  onClick,
  className
}: RestaurantCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/restaurant/${slug}`;
    }
  };

  const formatServices = (services: string[]) => {
    if (services.length === 0) return '';
    if (services.length <= 2) return services.join(', ');
    return `${services.slice(0, 2).join(', ')} +${services.length - 2}`;
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer bg-gradient-card border-glass shadow-card hover:shadow-float transition-smooth hover:scale-[1.02] overflow-hidden relative",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-smooth" />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-glass backdrop-blur-sm">
              {establishmentType}
            </Badge>
          </div>
          {distance && (
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-glass backdrop-blur-sm border-glass">
                <MapPin className="h-3 w-3 mr-1" />
                {distance.toFixed(1)}km
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 pb-12">
          {/* Nombre del restaurante */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-smooth">
              {name}
            </h3>
            
            {/* Tipo de cocina • Rating */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="line-clamp-1">
                {cuisineTypes.slice(0, 2).join(', ')}
              </span>
              {googleRating && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{googleRating}</span>
                  </div>
                </>
              )}
            </div>

            {/* Distancia • Rango de precio */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {distance && (
                <>
                  <span>{distance.toFixed(1)}km</span>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                <span className="font-medium text-foreground">{priceRange}</span>
              </div>
            </div>

            {/* Servicios */}
            {services.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {formatServices(services)}
              </div>
            )}
          </div>
        </div>

        {/* Corazón con favoritos en la esquina inferior derecha */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-glass backdrop-blur-sm rounded-full px-2 py-1 border border-glass">
          <Heart className="h-3 w-3 text-red-500" />
          <span className="text-xs font-medium">{favoritesCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
