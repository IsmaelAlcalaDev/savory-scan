
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
    <div className="space-y-4">
      <div className="text-left">
        <div className="relative">
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2 tracking-tight">
            {section.name}
          </h2>
          <div className="absolute -bottom-1 left-0 h-0.5 w-10 bg-gradient-to-r from-primary to-primary/40 rounded-full"></div>
        </div>
        {section.description && (
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-2xl">
            {section.description}
          </p>
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
