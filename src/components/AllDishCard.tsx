
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DishFavoriteButton from './DishFavoriteButton';

interface AllDishCardProps {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  categoryName?: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantId: number;
  restaurantRating?: number;
  distance?: number;
  formattedPrice: string;
  onClick?: () => void;
  className?: string;
  layout?: 'grid' | 'list';
}

export default function AllDishCard({
  id,
  name,
  description,
  basePrice,
  imageUrl,
  categoryName,
  restaurantName,
  restaurantSlug,
  restaurantId,
  restaurantRating,
  distance,
  formattedPrice,
  onClick,
  className,
  layout = 'grid'
}: AllDishCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to restaurant profile since we don't have individual dish pages
      window.location.href = `/restaurant/${restaurantSlug}`;
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
          "group cursor-pointer transition-all duration-300 hover:scale-[1.01] flex items-center gap-4 p-4 rounded-lg border bg-card",
          className
        )}
        onClick={handleClick}
      >
        <div className="w-24 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
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
            imageUrl ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
          )} />
          
          {categoryName && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
                {categoryName}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-20">
            <DishFavoriteButton
              dishId={id}
              restaurantId={restaurantId}
              favoritesCount={0}
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg hover:bg-white"
              savedFrom="list_card"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-1 transition-smooth">
              {name}
            </h3>
            <div className="text-foreground font-semibold text-base flex-shrink-0">
              {formattedPrice}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="line-clamp-1">{restaurantName}</span>
            {restaurantRating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground text-sm">{restaurantRating}</span>
                </div>
              </>
            )}
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
        {imageUrl ? (
          <img 
            src={imageUrl} 
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
          imageUrl ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
        )} />
        
        {categoryName && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
              {categoryName}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-20">
          <DishFavoriteButton
            dishId={id}
            restaurantId={restaurantId}
            favoritesCount={0}
            size="md"
            className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg hover:bg-white"
            savedFrom="grid_card"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base line-clamp-2 transition-smooth">
            {name}
          </h3>
          <div className="text-foreground font-semibold text-base flex-shrink-0">
            {formattedPrice}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="line-clamp-1">{restaurantName}</span>
          {restaurantRating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground text-sm">{restaurantRating}</span>
              </div>
            </>
          )}
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
