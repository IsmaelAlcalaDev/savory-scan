
import { type MenuSection } from '@/hooks/useRestaurantMenu';
import DishCard from './DishCard';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  restaurantId: number;
  onDishClick: (dish: Dish) => void;
}

export default function RestaurantMenuSection({ section, restaurantId, onDishClick }: RestaurantMenuSectionProps) {
  if (!section.dishes || section.dishes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">{section.name}</h2>
        {section.description && (
          <p className="text-muted-foreground">{section.description}</p>
        )}
      </div>
      
      <div className="space-y-1">
        {section.dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
            onDishClick={onDishClick}
          />
        ))}
      </div>
    </div>
  );
}
