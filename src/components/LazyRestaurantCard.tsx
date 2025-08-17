
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RestaurantCard = lazy(() => import('./RestaurantCard'));

interface LazyRestaurantCardProps {
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
  favoritesCount: number; // Make this required to match RestaurantCard
  coverImageUrl?: string;
  logoUrl?: string;
  onClick?: () => void;
  className?: string;
  onLoginRequired?: () => void;
  layout?: 'grid' | 'list';
  onFavoriteChange?: (restaurantId: number, isFavorite: boolean) => void;
  priority?: boolean;
}

const RestaurantCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export default function LazyRestaurantCard(props: LazyRestaurantCardProps) {
  return (
    <Suspense fallback={<RestaurantCardSkeleton />}>
      <RestaurantCard {...props} />
    </Suspense>
  );
}
