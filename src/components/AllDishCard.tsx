
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DishFavoriteButton from './DishFavoriteButton';

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
  custom_tags: string[];
  allergens: string[];
}

interface AllDishCardProps {
  dish: DishData;
  showRestaurantInfo?: boolean;
  onClick?: () => void;
  className?: string;
  layout?: 'grid' | 'list';
}

export default function AllDishCard({
  dish,
  showRestaurantInfo = false,
  onClick,
  className,
  layout = 'grid'
}: AllDishCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to restaurant profile since we don't have individual dish pages
      window.location.href = `/restaurant/${dish.restaurant_slug}`;
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
          {dish.image_url ? (
            <img 
              src={dish.image_url} 
              alt={dish.image_alt || dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : null}
          <div className={cn(
            "absolute inset-0 transition-smooth",
            dish.image_url ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
          )} />
          
          {dish.category_name && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
                {dish.category_name}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-2 right-2 z-20">
            <DishFavoriteButton
              dishId={dish.id}
              restaurantId={dish.restaurant_id}
              favoritesCount={dish.favorites_count}
              size="sm"
              className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg hover:bg-white"
              savedFrom="list_card"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base line-clamp-1 transition-smooth">
              {dish.name}
            </h3>
            {dish.restaurant_google_rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground text-sm">{dish.restaurant_google_rating}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {showRestaurantInfo && (
              <>
                <span className="line-clamp-1">{dish.restaurant_name}</span>
                <span>•</span>
              </>
            )}
            <span className="text-foreground font-medium">{dish.formatted_price}</span>
            {dish.distance_km && (
              <>
                <span>•</span>
                <span className="flex-shrink-0">{formatDistance(dish.distance_km)}</span>
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
        {dish.image_url ? (
          <img 
            src={dish.image_url} 
            alt={dish.image_alt || dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}
        <div className={cn(
          "absolute inset-0 transition-smooth",
          dish.image_url ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
        )} />
        
        {dish.category_name && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-foreground text-xs shadow-sm pointer-events-none">
              {dish.category_name}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-20">
          <DishFavoriteButton
            dishId={dish.id}
            restaurantId={dish.restaurant_id}
            favoritesCount={dish.favorites_count}
            size="md"
            className="bg-white/95 backdrop-blur-sm border-white/20 shadow-lg hover:bg-white"
            savedFrom="grid_card"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-base line-clamp-2 transition-smooth">
            {dish.name}
          </h3>
          {dish.restaurant_google_rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground text-sm">{dish.restaurant_google_rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {showRestaurantInfo && (
            <>
              <span className="line-clamp-1">{dish.restaurant_name}</span>
              <span>•</span>
            </>
          )}
          <span className="text-foreground font-medium">{dish.formatted_price}</span>
          {dish.distance_km && (
            <>
              <span>•</span>
              <span className="flex-shrink-0">{formatDistance(dish.distance_km)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
