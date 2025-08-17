
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Star } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { Restaurant } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

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
  favoritesCount: number;
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
  services,
  favoritesCount,
  coverImageUrl,
  logoUrl,
  onClick,
  className,
  onLoginRequired,
  priority = false
}: RestaurantCardProps) {
  const { trackCardClick, trackActionClick, trackFeedImpression } = useAnalytics();
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  // Track impression when card becomes visible
  useEffect(() => {
    if (!hasBeenViewed) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasBeenViewed) {
              trackFeedImpression([id]);
              setHasBeenViewed(true);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );

      const cardElement = document.querySelector(`[data-restaurant-id="${id}"]`);
      if (cardElement) {
        observer.observe(cardElement);
      }

      return () => observer.disconnect();
    }
  }, [id, hasBeenViewed, trackFeedImpression]);

  const handleCardClick = () => {
    trackCardClick('restaurant', id);
    onClick?.();
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackActionClick('call', id);
  };

  const handleDirectionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackActionClick('directions', id);
  };

  const navigate = useNavigate();

  const getRatingColor = (rating: number | null | undefined) => {
    if (!rating) return 'text-gray-500';
    if (rating >= 4.0) return 'text-green-500';
    if (rating >= 3.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formattedDistance = distance !== null && distance !== undefined
    ? `${distance.toFixed(1)} km`
    : 'No disponible';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // prevent infinite loop
    e.currentTarget.src = "/placeholder-restaurant.png";
  };

  return (
    <Card 
      className={cn("overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group", className)}
      onClick={handleCardClick}
      data-restaurant-id={id}
      data-analytics-element="restaurant-card"
    >
      <div className="relative">
        <img
          src={coverImageUrl || "/placeholder-restaurant.png"}
          alt={name}
          className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs py-1 px-2 rounded-md">
          {formattedDistance}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
          <div className="flex items-center space-x-1.5">
            <Star className={cn("h-4 w-4", getRatingColor(googleRating))} />
            <span className={cn("text-sm font-medium", getRatingColor(googleRating))}>
              {googleRating?.toFixed(1) || "N/A"}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || 'Sin descripción'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground"
              onClick={handleCallClick}
              data-analytics-action="call-click"
              data-analytics-restaurant-id={id}
            >
              <Phone className="h-3 w-3 mr-1" />
              Llamar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs hover:bg-primary hover:text-primary-foreground"
              onClick={handleDirectionsClick}
              data-analytics-action="directions-click"
              data-analytics-restaurant-id={id}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Cómo llegar
            </Button>
          </div>
          
          <FavoriteButton 
            restaurantId={id}
            restaurantSlug={slug}
            favoritesCount={favoritesCount || 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
