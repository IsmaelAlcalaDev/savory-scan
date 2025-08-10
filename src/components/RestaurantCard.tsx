import { Star, MapPin, Clock, Euro } from 'lucide-react';
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

  return (
    <Card 
      className={cn(
        "group cursor-pointer bg-gradient-card border-glass shadow-card hover:shadow-float transition-smooth hover:scale-[1.02] overflow-hidden",
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

        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-smooth">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {googleRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{googleRating}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Euro className="h-3 w-3" />
                <span className="text-sm">{priceRange}</span>
              </div>
            </div>
          </div>

          {cuisineTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cuisineTypes.slice(0, 3).map((cuisine, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-secondary/50"
                >
                  {cuisine}
                </Badge>
              ))}
              {cuisineTypes.length > 3 && (
                <Badge variant="outline" className="text-xs bg-secondary/50">
                  +{cuisineTypes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}