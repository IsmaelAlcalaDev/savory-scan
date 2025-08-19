
import React from 'react';
import AllDishCard from './AllDishCard';
import { formatPrice } from '@/lib/utils';

interface DishWithRestaurant {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  category_name?: string;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_id: number;
  restaurant_rating?: number;
  distance?: number;
}

interface DishesGridProps {
  dishes: DishWithRestaurant[];
  loading?: boolean;
}

export default function DishesGrid({ dishes, loading }: DishesGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-video rounded-t-lg"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!dishes?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron platos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {dishes.map((dish) => (
        <AllDishCard
          key={dish.id}
          id={dish.id}
          name={dish.name}
          description={dish.description}
          base_price={dish.base_price}
          imageUrl={dish.image_url}
          categoryName={dish.category_name}
          restaurantName={dish.restaurant_name}
          restaurantSlug={dish.restaurant_slug}
          restaurantId={dish.restaurant_id}
          restaurantRating={dish.restaurant_rating}
          distance={dish.distance}
          formattedPrice={formatPrice(dish.base_price)}
        />
      ))}
    </div>
  );
}
