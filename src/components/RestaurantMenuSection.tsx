
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-2">
      <div className="text-left">
        <h2 className="text-xl font-bold text-foreground mb-1">{section.name}</h2>
        {section.description && (
          <p className="text-muted-foreground">{section.description}</p>
        )}
      </div>
      
      <div className="space-y-1">
        {section.dishes.map((dish, index) => (
          <div key={dish.id}>
            <DishCard
              dish={dish}
              restaurantId={restaurantId}
              expandedDishId={expandedDishId}
              onExpandedChange={setExpandedDishId}
            />
            {index < section.dishes.length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
