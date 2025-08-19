
import React from 'react';
import RestaurantCard, { RestaurantCardProps } from './RestaurantCard';
import { useActionTracking } from '@/hooks/useActionTracking';

interface InstrumentedRestaurantCardProps extends RestaurantCardProps {
  position?: number;
}

export default function InstrumentedRestaurantCard(props: InstrumentedRestaurantCardProps) {
  const { trackAction } = useActionTracking();

  const handleClick = () => {
    trackAction('restaurant_card_click', {
      restaurant_id: props.id,
      restaurant_name: props.name,
      position: props.position,
      distance: props.distance,
      rating: props.googleRating,
      price_range: props.priceRange
    });
    
    // Navigate to restaurant profile
    window.location.href = `/restaurante/${props.slug}`;
  };

  return (
    <div
      onClick={handleClick}
      data-analytics-restaurant-id={props.id}
      data-analytics-action="restaurant_card_click"
      className="cursor-pointer"
    >
      <RestaurantCard {...props} />
    </div>
  );
}
