
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DishFavoriteButton from './DishFavoriteButton';
import OptimizedImage from './OptimizedImage';
import { formatPrice } from '@/lib/utils';

export interface AllDishCardProps {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  imageUrl?: string;
  categoryName?: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantId: number;
  restaurantRating?: number;
  distance?: number;
  formattedPrice: string;
}

export default function AllDishCard({
  id,
  name,
  description,
  base_price,
  imageUrl,
  categoryName,
  restaurantName,
  restaurantSlug,
  restaurantId,
  restaurantRating,
  distance,
  formattedPrice
}: AllDishCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <OptimizedImage
            src={imageUrl || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <DishFavoriteButton
              dishId={id}
              restaurantId={restaurantId}
              size="sm"
            />
          </div>
          {categoryName && (
            <Badge className="absolute top-2 left-2 bg-black/70 text-white">
              {categoryName}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            <span className="font-bold text-primary ml-2">{formattedPrice}</span>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">{restaurantName}</span>
            <div className="flex items-center gap-2">
              {restaurantRating && (
                <span>⭐ {restaurantRating.toFixed(1)}</span>
              )}
              {distance && (
                <span>{distance.toFixed(1)} km</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
