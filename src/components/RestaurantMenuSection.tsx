
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
    <div className="space-y-4">
      <div className="text-left">
        <h2 className="text-xl font-bold text-foreground mb-3">
          {section.name}
        </h2>
        {section.description && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mb-4">
            {section.description}
          </p>
        )}
      </div>
      
      <div>
        {section.dishes.map((dish, index) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
            expandedDishId={expandedDishId}
            onExpandedChange={setExpandedDishId}
            isFirstInSection={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
