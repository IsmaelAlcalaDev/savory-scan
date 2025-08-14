
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Wheat, 
  Milk, 
  Heart, 
  Flame, 
  Clock, 
  Plus,
  Fish,
  Egg,
  TreePine,
  Cherry,
  Shell
} from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

// Mapping of common allergen slugs to icons
const allergenIconMap: Record<string, { icon: typeof Leaf; label: string }> = {
  'gluten': { icon: Wheat, label: 'Gluten' },
  'dairy': { icon: Milk, label: 'Lácteos' },
  'lactose': { icon: Milk, label: 'Lactosa' },
  'fish': { icon: Fish, label: 'Pescado' },
  'shellfish': { icon: Shell, label: 'Mariscos' },
  'eggs': { icon: Egg, label: 'Huevos' },
  'nuts': { icon: TreePine, label: 'Frutos secos' },
  'peanuts': { icon: Cherry, label: 'Cacahuetes' },
  'soy': { icon: Leaf, label: 'Soja' },
  'sesame': { icon: Cherry, label: 'Sésamo' }
};

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

  // Get allergen icons (limit to 4-5 most important ones)
  const getAllergenIcons = () => {
    if (!dish.allergens || !Array.isArray(dish.allergens)) return [];
    
    return dish.allergens
      .slice(0, 5)
      .map((allergen: string) => {
        const allergenInfo = allergenIconMap[allergen.toLowerCase()];
        if (allergenInfo) {
          return {
            icon: allergenInfo.icon,
            label: allergenInfo.label,
            slug: allergen
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div 
      className="py-4 px-0 hover:bg-accent/30 transition-colors cursor-pointer" 
      onClick={() => onDishClick?.(dish)}
    >
      <div className="flex gap-4 items-start w-full">
        {/* Image */}
        <div className="flex-shrink-0">
          {dish.image_url ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden relative">
              <img
                src={dish.image_url}
                alt={dish.image_alt || dish.name}
                className="w-full h-full object-cover"
              />
              {dish.is_featured && (
                <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 py-0">
                  ★
                </Badge>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
            </div>
          )}
        </div>

        {/* Content - Full Width */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
          {/* Top Row - Name and Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 pr-4">
              {dish.name}
            </h3>
            <div className="font-bold text-lg text-primary text-right flex-shrink-0">
              {getDisplayPrice()}
            </div>
          </div>

          {/* Description - condensed */}
          {dish.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
              {dish.description}
            </p>
          )}

          {/* Bottom Row - Icons, time and actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Diet icons */}
              {getDietIcon(dish).slice(0, 4).map(({ icon: Icon, label, color }, index) => (
                <div key={index} title={label}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              ))}

              {/* Allergen icons */}
              {getAllergenIcons().slice(0, 3).map((allergen, index) => {
                const Icon = allergen!.icon;
                return (
                  <div key={index} title={`Contiene: ${allergen!.label}`}>
                    <Icon className="h-4 w-4 text-orange-500" />
                  </div>
                );
              })}

              {/* Spice level */}
              {dish.spice_level > 0 && (
                <div className="flex items-center gap-0.5" title={`Nivel de picante: ${dish.spice_level}`}>
                  {getSpiceLevel(dish.spice_level)}
                </div>
              )}

              {/* Preparation time */}
              {dish.preparation_time_minutes && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{dish.preparation_time_minutes}min</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DishFavoriteButton
                dishId={dish.id}
                restaurantId={restaurantId}
                favoritesCount={dish.favorites_count}
                size="sm"
                className="bg-background/95 backdrop-blur-sm border-border/20 shadow-sm hover:bg-accent"
                savedFrom="menu_list"
              />
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDishClick?.(dish);
                }}
                className="gap-1 h-8 px-3 text-sm"
              >
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
