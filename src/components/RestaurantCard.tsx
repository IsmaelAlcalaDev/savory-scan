
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';

interface RestaurantCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priceRange: string;
  googleRating?: number;
  googleRatingCount?: number;
  distance?: number;
  cuisineTypes: string[];
  establishmentType?: string;
  services?: string[];
  favoritesCount?: number;
  coverImageUrl?: string;
  logoUrl?: string;
  onClick?: () => void;
  className?: string;
  onLoginRequired?: () => void;
  layout?: 'grid' | 'list';
  onFavoriteChange?: (restaurantId: number, isFavorite: boolean) => void;
}

export default function RestaurantCard({
  id,
  name,
  slug,
  description,
  priceRange,
  googleRating,
  googleRatingCount,
  distance,
  cuisineTypes,
  establishmentType,
  services = [],
  favoritesCount = 0,
  coverImageUrl,
  logoUrl,
  onClick,
  className,
  onLoginRequired = () => {},
  layout = 'grid',
  onFavoriteChange
}: RestaurantCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/restaurant/${slug}`;
    }
  };

  const displayImage = coverImageUrl || logoUrl;

  const formatDistance = (distanceKm: number) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  if (layout === 'list') {
    return (
      <div 
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:scale-[1.01] flex items-center gap-4 p-4 rounded-lg border bg-card",
          className
        )}
        onClick={handleClick}
      >
        <div className="w-24 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : null}
          <div className={cn(
            "absolute inset-0 transition-smooth",
            displayImage ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
          )} />
          
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
              {establishmentType}
            </Badge>
          </div>
          
          <div className="absolute bottom-2 right-2">
            <FavoriteButton
              restaurantId={id}
              favoritesCount={favoritesCount}
              onLoginRequired={onLoginRequired}
              savedFrom="list_card"
              size="sm"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {logoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt={`${name} logo`}
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-smooth">
              {name}
            </h3>
            {googleRating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground text-sm">{googleRating}</span>
                {googleRatingCount && (
                  <span className="text-muted-foreground text-sm">({googleRatingCount})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="line-clamp-1">
              {cuisineTypes.slice(0, 2).join(', ')}
            </span>
            <span>•</span>
            <span className="text-foreground">{priceRange}</span>
            {distance && (
              <>
                <span>•</span>
                <span className="flex-shrink-0">{formatDistance(distance)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      <div className="aspect-[5/3] relative overflow-hidden rounded-lg mb-2">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
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
          <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
            {establishmentType}
          </Badge>
        </div>
        
        <div className="absolute bottom-3 right-3">
          <FavoriteButton
            restaurantId={id}
            favoritesCount={favoritesCount}
            onLoginRequired={onLoginRequired}
            savedFrom="grid_card"
            size="md"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-smooth">
            {name}
          </h3>
          {googleRating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground text-sm">{googleRating}</span>
              {googleRatingCount && (
                <span className="text-muted-foreground text-sm">({googleRatingCount})</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="line-clamp-1">
            {cuisineTypes.slice(0, 2).join(', ')}
          </span>
          <span>•</span>
          <span className="text-foreground">{priceRange}</span>
          {distance && (
            <>
              <span>•</span>
              <span className="flex-shrink-0">{formatDistance(distance)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
