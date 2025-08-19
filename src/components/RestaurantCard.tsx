
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OptimizedImage from './OptimizedImage';
import FavoriteButton from './FavoriteButton';
import { Star, MapPin, Clock } from 'lucide-react';

export interface RestaurantCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priceRange: string;
  googleRating?: number;
  googleRatingCount?: number;
  distance?: number;
  coverImageUrl?: string;
  logoUrl?: string;
  cuisineTypes?: Array<{ name: string; slug: string }>;
  establishmentType?: string;
  favoritesCount?: number;
  isOpen?: boolean;
  estimatedWaitTime?: string;
  position?: number;
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
  coverImageUrl,
  logoUrl,
  cuisineTypes,
  establishmentType,
  favoritesCount,
  isOpen,
  estimatedWaitTime,
  position
}: RestaurantCardProps) {
  const handleCardClick = () => {
    window.location.href = `/restaurante/${slug}`;
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <OptimizedImage
            src={coverImageUrl || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              restaurantId={id}
              size="sm"
            />
          </div>
          
          {isOpen !== undefined && (
            <Badge 
              className={`absolute top-2 left-2 ${
                isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isOpen ? 'Abierto' : 'Cerrado'}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
              />
            )}
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              {googleRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{googleRating.toFixed(1)}</span>
                  {googleRatingCount && (
                    <span className="text-xs">({googleRatingCount})</span>
                  )}
                </div>
              )}
              
              {distance && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {estimatedWaitTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{estimatedWaitTime}</span>
                </div>
              )}
              
              <Badge variant="outline" className="text-xs">
                {priceRange}
              </Badge>
            </div>
          </div>
          
          {cuisineTypes && cuisineTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {cuisineTypes.slice(0, 3).map((cuisine, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cuisine.name}
                </Badge>
              ))}
              {cuisineTypes.length > 3 && (
                <Badge variant="secondary" className="text-xs">
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
