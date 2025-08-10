
import { Star, Heart } from 'lucide-react';
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
  reviewCount?: number;
  distance?: number;
  cuisineTypes: string[];
  establishmentType?: string;
  services?: string[];
  favoritesCount?: number;
  onClick?: () => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export default function RestaurantCard({
  id,
  name,
  slug,
  description,
  priceRange,
  googleRating,
  reviewCount,
  distance,
  cuisineTypes,
  establishmentType,
  services = [],
  favoritesCount = 0,
  onClick,
  className,
  viewMode = 'grid'
}: RestaurantCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/restaurant/${slug}`;
    }
  };

  const renderServices = () => {
    if (services.length === 0) return null;
    
    const visibleServices = services.slice(0, 2);
    const remainingCount = services.length - 2;
    
    return (
      <div className="flex gap-1 flex-wrap">
        {visibleServices.map((service, index) => (
          <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
            {service}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <Badge variant="outline" className="text-xs px-2 py-0.5">
            +{remainingCount}
          </Badge>
        )}
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className={cn(
          "group cursor-pointer bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden relative",
          "shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_0_rgba(0,0,0,0.15)]",
          className
        )}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Image - smaller in list mode */}
            <div className="w-32 h-24 bg-gradient-hero relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-smooth" />
              <div className="absolute top-1 left-1">
                <Badge variant="secondary" className="bg-glass backdrop-blur-sm text-xs">
                  {establishmentType}
                </Badge>
              </div>
            </div>

            {/* Content area with white background */}
            <div className="flex-1 bg-white p-4 space-y-2">
              {/* Nombre del restaurante con corazón */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-smooth flex-1 min-w-0 break-words">
                  {name}
                </h3>
                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-200 flex-shrink-0">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-xs font-medium">{favoritesCount}</span>
                </div>
              </div>
              
              {/* Tipo de cocina seguido inmediatamente del rating */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="line-clamp-1">
                  {cuisineTypes.slice(0, 2).join(', ')}
                </span>
                {googleRating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-foreground">{googleRating}</span>
                      {reviewCount && (
                        <span className="text-muted-foreground">({reviewCount})</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Distancia • Rango de precio */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {distance && (
                  <>
                    <span className="flex-shrink-0">{distance.toFixed(1)}km</span>
                    <span>•</span>
                  </>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="font-medium text-foreground">{priceRange}</span>
                </div>
              </div>

              {/* Servicios como tags */}
              {renderServices()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group cursor-pointer bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden relative",
        "shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_0_rgba(0,0,0,0.15)]",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Image placeholder - Reduced height */}
        <div className="h-32 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-smooth" />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-glass backdrop-blur-sm text-xs">
              {establishmentType}
            </Badge>
          </div>
        </div>

        {/* Content area with white background */}
        <div className="bg-white p-4 space-y-2">
          {/* Nombre del restaurante con corazón */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-smooth flex-1 min-w-0 break-words">
              {name}
            </h3>
            <div className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-200 flex-shrink-0">
              <Heart className="h-3 w-3 text-red-500" />
              <span className="text-xs font-medium">{favoritesCount}</span>
            </div>
          </div>
          
          {/* Tipo de cocina seguido inmediatamente del rating */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="line-clamp-1">
              {cuisineTypes.slice(0, 2).join(', ')}
            </span>
            {googleRating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{googleRating}</span>
                  {reviewCount && (
                    <span className="text-muted-foreground">({reviewCount})</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Distancia • Rango de precio */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {distance && (
              <>
                <span className="flex-shrink-0">{distance.toFixed(1)}km</span>
                <span>•</span>
              </>
            )}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="font-medium text-foreground">{priceRange}</span>
            </div>
          </div>

          {/* Servicios como tags */}
          {renderServices()}
        </div>
      </CardContent>
    </Card>
  );
}
