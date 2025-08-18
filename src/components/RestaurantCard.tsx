
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FavoriteButton from './FavoriteButton';
import OptimizedImage from './OptimizedImage';

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
  priority?: boolean;
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
  onClick,
  className,
  onLoginRequired = () => {},
  layout = 'grid',
  onFavoriteChange,
  priority = false
}: RestaurantCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/restaurant/${slug}`;
    }
  };

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
          "group cursor-pointer transition-all duration-300 hover:scale-[1.01] flex items-center gap-4 p-4 rounded-lg border bg-card shadow-sm hover:shadow-md",
          className
        )}
        onClick={handleClick}
      >
        <div className="w-24 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
          {coverImageUrl && (
            <OptimizedImage
              src={coverImageUrl}
              alt={name}
              width={96}
              height={96}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={priority}
              sizes="96px"
            />
          )}
          <div className={cn(
            "absolute inset-0 transition-smooth",
            coverImageUrl ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-to-br from-primary/20 to-primary/5"
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
            <h3 className="text-base line-clamp-1 text-foreground font-medium">
              {name}
            </h3>
            
            {googleRating && typeof googleRating === 'number' && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground text-sm">{googleRating.toFixed(1)}</span>
                {googleRatingCount && typeof googleRatingCount === 'number' && (
                  <span className="text-muted-foreground text-xs">({googleRatingCount})</span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="line-clamp-1">
              {cuisineTypes.slice(0, 2).join(', ')}
            </span>
            <span>•</span>
            <span className="text-muted-foreground font-medium">{priceRange}</span>
            {distance && typeof distance === 'number' && (
              <>
                <span>•</span>
                <span className="flex-shrink-0 text-foreground font-medium">{formatDistance(distance)}</span>
              </>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
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
        {coverImageUrl && (
          <OptimizedImage
            src={coverImageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className={cn(
          "absolute inset-0 transition-smooth",
          coverImageUrl ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-to-br from-primary/20 to-primary/5"
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

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base line-clamp-1 text-foreground font-medium">
            {name}
          </h3>
          {googleRating && typeof googleRating === 'number' && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground text-sm">{googleRating.toFixed(1)}</span>
              {googleRatingCount && typeof googleRatingCount === 'number' && (
                <span className="text-muted-foreground text-xs">({googleRatingCount})</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="line-clamp-1">
            {cuisineTypes.slice(0, 2).join(', ')}
          </span>
          <span>•</span>
          <span className="text-muted-foreground font-medium">{priceRange}</span>
          {distance && typeof distance === 'number' && (
            <>
              <span>•</span>
              <span className="flex-shrink-0 text-foreground font-medium">{formatDistance(distance)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
