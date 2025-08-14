
import { useState } from 'react';
import DishCard from './DishCard';
import type { MenuSection } from '@/hooks/useRestaurantMenu';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  restaurantId: number;
}

export default function RestaurantMenuSection({ 
  section, 
  restaurantId
}: RestaurantMenuSectionProps) {
  const [expandedDishId, setExpandedDishId] = useState<number | null>(null);

  if (!section.dishes || section.dishes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{section.name}</h2>
        {section.description && (
          <p className="text-muted-foreground">{section.description}</p>
        )}
      </div>
      
      <div className="space-y-3">
        {section.dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
            expandedDishId={expandedDishId}
            onExpandedChange={setExpandedDishId}
          />
        ))}
      </div>
    </div>
  );
}
