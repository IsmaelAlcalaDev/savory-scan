
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils } from 'lucide-react';
import DishCard from './DishCard';
import type { MenuSection, Dish } from '@/hooks/useRestaurantMenu';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

export default function RestaurantMenuSection({ section, restaurantId, onDishClick }: RestaurantMenuSectionProps) {
  return (
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          {section.name}
        </CardTitle>
        {section.description && (
          <p className="text-muted-foreground text-sm">{section.description}</p>
        )}
      </CardHeader>
      <CardContent>
        {section.dishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.dishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                restaurantId={restaurantId}
                onDishClick={onDishClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay platos disponibles en esta sección</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
