
import { type MenuSection } from '@/hooks/useRestaurantMenu';
import DishCard from './DishCard';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  restaurantId: number;
}

export default function RestaurantMenuSection({ section, restaurantId }: RestaurantMenuSectionProps) {
  if (!section.dishes || section.dishes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">{section.name}</h2>
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </div>
      
      <div className="divide-y divide-border/30">
        {section.dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
          />
        ))}
      </div>
    </div>
  );
}
