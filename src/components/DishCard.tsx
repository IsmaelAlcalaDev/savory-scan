import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Wheat, Milk, Heart, Flame, Clock, Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

export default function DishCard({ dish, restaurantId, onDishClick }: DishCardProps) {
  const getDietIcon = (dish: Dish) => {
    const icons = [];
    if (dish.is_vegetarian) icons.push({ icon: Leaf, label: 'Vegetariano', color: 'text-green-500' });
    if (dish.is_vegan) icons.push({ icon: Leaf, label: 'Vegano', color: 'text-green-600' });
    if (dish.is_gluten_free) icons.push({ icon: Wheat, label: 'Sin gluten', color: 'text-amber-500' });
    if (dish.is_lactose_free) icons.push({ icon: Milk, label: 'Sin lactosa', color: 'text-blue-500' });
    if (dish.is_healthy) icons.push({ icon: Heart, label: 'Saludable', color: 'text-red-500' });
    return icons;
  };

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null;
    return Array.from({ length: level }, (_, i) => (
      <Flame key={i} className="h-3 w-3 text-red-500 fill-current" />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (dish.variants && dish.variants.length > 0) {
      const defaultVariant = dish.variants.find(v => v.is_default);
      if (defaultVariant) {
        return formatPrice(defaultVariant.price);
      }
      const minPrice = Math.min(...dish.variants.map(v => v.price));
      const maxPrice = Math.max(...dish.variants.map(v => v.price));
      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(dish.base_price);
  };

  return (
    <Card className="bg-gradient-card border-glass shadow-card hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onDishClick?.(dish)}>
      <div className="relative">
        {dish.image_url ? (
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img
              src={dish.image_url}
              alt={dish.image_alt || dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] bg-muted rounded-t-lg flex items-center justify-center">
            <div className="text-muted-foreground text-sm">Sin imagen</div>
          </div>
        )}
        
        {dish.is_featured && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
            Destacado
          </Badge>
        )}

        <div className="absolute top-2 right-2 z-10">
          <DishFavoriteButton
            dishId={dish.id}
            favoritesCount={dish.favorites_count}
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          />
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {dish.name}
          </h3>
          
          {dish.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {dish.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Diet icons */}
          {getDietIcon(dish).map(({ icon: Icon, label, color }, index) => (
            <Icon key={index} className={`h-3 w-3 ${color}`} title={label} />
          ))}

          {/* Spice level */}
          {dish.spice_level > 0 && (
            <div className="flex items-center gap-1" title={`Nivel de picante: ${dish.spice_level}`}>
              {getSpiceLevel(dish.spice_level)}
            </div>
          )}

          {/* Preparation time */}
          {dish.preparation_time_minutes && (
            <div className="flex items-center gap-1 text-muted-foreground ml-auto">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{dish.preparation_time_minutes}min</span>
            </div>
          )}
        </div>

        {/* Category */}
        {dish.category_name && (
          <Badge variant="outline" className="text-xs w-fit">
            {dish.category_name}
          </Badge>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="font-bold text-lg text-primary">
            {getDisplayPrice()}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDishClick?.(dish);
            }}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
