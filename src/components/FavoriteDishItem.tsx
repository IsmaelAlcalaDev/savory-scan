
import React from 'react';
import DishFavoriteButton from '@/components/DishFavoriteButton';
import { cn } from '@/lib/utils';

type Props = {
  id: number;
  name: string;
  restaurantName: string;
  restaurantId: number;
  basePrice: number;
  imageUrl?: string;
  favoritesCount?: number;
  className?: string;
};

export default function FavoriteDishItem({
  id,
  name,
  restaurantName,
  restaurantId,
  basePrice,
  imageUrl,
  favoritesCount = 0,
  className
}: Props) {
  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`;
  };

  return (
    <div
      className={cn(
        'w-full rounded-lg border bg-card text-card-foreground shadow-sm p-3',
        'flex items-center gap-3',
        className
      )}
      role="article"
      aria-label={`Plato ${name}`}
    >
      <img
        src={imageUrl || '/placeholder.svg'}
        alt={name}
        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-semibold truncate">{name}</h4>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {restaurantName}
            </div>
          </div>
          {/* Corazón fuera de la imagen */}
          <DishFavoriteButton
            dishId={id}
            restaurantId={restaurantId}
            favoritesCount={favoritesCount}
            savedFrom="favorites_page"
            size="sm"
          />
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          <span>{formatPrice(basePrice)}</span>
        </div>
      </div>
    </div>
  );
}
