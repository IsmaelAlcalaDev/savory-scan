
import { Star, Heart } from 'lucide-react';
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
  coverImageUrl?: string;
  logoUrl?: string;
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
  reviewCount,
  distance,
  cuisineTypes,
  establishmentType,
  services = [],
  favoritesCount = 0,
  coverImageUrl,
  logoUrl,
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

  // Elegir la mejor imagen disponible
  const displayImage = coverImageUrl || logoUrl;

  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      {/* Imagen rectangular redondeada */}
      <div className="aspect-[4/3] relative overflow-hidden rounded-2xl mb-3">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}
        <div className={cn(
          "absolute inset-0 transition-smooth",
          displayImage ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
        )} />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-glass backdrop-blur-sm text-xs">
            {establishmentType}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
            <Heart className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium">{favoritesCount}</span>
          </div>
        </div>
      </div>

      {/* Datos fuera de la imagen, sin bordes */}
      <div className="space-y-2">
        {/* Nombre del restaurante */}
        <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-smooth">
          {name}
        </h3>
        
        {/* Rating justo debajo del nombre */}
        {googleRating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground text-sm">{googleRating}</span>
            {reviewCount && (
              <span className="text-muted-foreground text-sm">({reviewCount})</span>
            )}
          </div>
        )}
        
        {/* Tipo de cocina · Distancia · Precio en una sola línea */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="line-clamp-1">
            {cuisineTypes.slice(0, 2).join(', ')}
          </span>
          {distance && (
            <>
              <span>•</span>
              <span className="flex-shrink-0">{distance.toFixed(1)}km</span>
            </>
          )}
          <span>•</span>
          <span className="font-medium text-foreground">{priceRange}</span>
        </div>
      </div>
    </div>
  );
}
