
import React from 'react';
import FavoriteButton from '@/components/FavoriteButton';
import { cn } from '@/lib/utils';

type Props = {
  id: number;
  name: string;
  slug: string;
  priceRange: string;
  googleRating?: number;
  googleRatingCount?: number;
  cuisineTypes: string[];
  establishmentType?: string;
  favoritesCount?: number;
  coverImageUrl?: string;
  logoUrl?: string;
  className?: string;
};

export default function FavoriteRestaurantItem({
  id,
  name,
  slug,
  priceRange,
  googleRating,
  googleRatingCount,
  cuisineTypes,
  establishmentType,
  favoritesCount = 0,
  coverImageUrl,
  logoUrl,
  className
}: Props) {
  return (
    <div
      className={cn(
        'w-full rounded-lg border bg-card text-card-foreground shadow-sm p-3',
        'flex items-center gap-3',
        className
      )}
      role="article"
      aria-label={`Restaurante ${name}`}
    >
      <img
        src={coverImageUrl || logoUrl || '/placeholder.svg'}
        alt={name}
        className="h-16 w-16 rounded-md object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <a href={`/restaurant/${slug}`} className="block">
              <h4 className="font-semibold truncate">{name}</h4>
            </a>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {establishmentType ? `${establishmentType} • ` : ''}
              {cuisineTypes.filter(Boolean).join(', ')}
            </div>
          </div>
          {/* Corazón fuera de la imagen */}
          <FavoriteButton
            restaurantId={id}
            favoritesCount={favoritesCount}
            savedFrom="favorites_page"
            size="sm"
          />
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {typeof googleRating === 'number' && (
            <span>{googleRating.toFixed(1)} ★</span>
          )}
          {typeof googleRatingCount === 'number' && (
            <span>({googleRatingCount})</span>
          )}
          <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>{priceRange}</span>
        </div>
      </div>
    </div>
  );
}
