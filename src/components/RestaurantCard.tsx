
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { DEFAULT_RESTAURANT_IMAGE_URL } from '@/constants';
import RestaurantVerificationBadge from './RestaurantVerificationBadge';

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
  verification_level?: 'basic' | 'standard' | 'premium';
  verification_status?: 'pending' | 'in_review' | 'verified' | 'rejected' | 'disputed' | 'suspended';
  verification_score?: number;
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
  layout = 'grid',
  onFavoriteChange,
  priority = false,
  verification_level,
  verification_status,
  verification_score,
  ...rest
}: RestaurantCardProps) {
  const { navigate } = useNavigation();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/restaurant/${slug}`);
    }
  }, [slug, onClick, navigate]);

  return (
    <div 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${className}`}
      onClick={handleClick}
      {...rest}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        {coverImageUrl ? (
          <div className="relative w-full h-48 md:h-52 lg:h-56">
            <img
              src={coverImageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 transform scale-100 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          </div>
        ) : (
          <div className="relative w-full h-48 md:h-52 lg:h-56">
            <img
              src={DEFAULT_RESTAURANT_IMAGE_URL}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 transform scale-100 group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
            />
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header con nombre y verificación */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {name}
                </h3>
                {establishmentType && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {establishmentType}
                  </p>
                )}
              </div>
              
              {/* Badge de verificación */}
              {verification_status && verification_level && (
                <RestaurantVerificationBadge
                  verificationLevel={verification_level}
                  verificationStatus={verification_status}
                  verificationScore={verification_score}
                  className="flex-shrink-0"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {cuisineTypes?.map((cuisine, index) => (
                <React.Fragment key={index}>
                  <Link
                    to={`/restaurants?cuisine=${cuisine}`}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-0.5 text-sm font-semibold transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                  >
                    {cuisine}
                  </Link>
                  {index < cuisineTypes.length - 1 && (
                    <span className="text-muted-foreground">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {googleRating && (
                <div className="flex items-center">
                  <span className="text-sm font-medium">{googleRating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({googleRatingCount})
                  </span>
                </div>
              )}
              {distance && (
                <div className="flex items-center">
                  <span className="text-sm font-medium">{distance} km</span>
                </div>
              )}
              {priceRange && (
                <div className="flex items-center">
                  <span className="text-sm font-medium">{priceRange}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
