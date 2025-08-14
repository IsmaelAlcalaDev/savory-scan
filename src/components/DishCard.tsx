
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

// Mapping of common allergen slugs to colors
const allergenColorMap: Record<string, { color: string; label: string }> = {
  'gluten': { color: 'bg-amber-500', label: 'Gluten' },
  'dairy': { color: 'bg-blue-500', label: 'Lácteos' },
  'lactose': { color: 'bg-blue-400', label: 'Lactosa' },
  'fish': { color: 'bg-cyan-500', label: 'Pescado' },
  'shellfish': { color: 'bg-teal-500', label: 'Mariscos' },
  'eggs': { color: 'bg-yellow-500', label: 'Huevos' },
  'nuts': { color: 'bg-orange-600', label: 'Frutos secos' },
  'peanuts': { color: 'bg-orange-500', label: 'Cacahuetes' },
  'soy': { color: 'bg-green-600', label: 'Soja' },
  'sesame': { color: 'bg-amber-600', label: 'Sésamo' }
};

export default function DishCard({ dish, restaurantId, onDishClick }: DishCardProps) {
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

  // Get allergen circles (limit to 6 most important ones)
  const getAllergenCircles = () => {
    if (!dish.allergens || !Array.isArray(dish.allergens)) return [];
    
    return dish.allergens
      .slice(0, 6)
      .map((allergen: string) => {
        const allergenInfo = allergenColorMap[allergen.toLowerCase()];
        if (allergenInfo) {
          return {
            color: allergenInfo.color,
            label: allergenInfo.label,
            slug: allergen
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const allergenCircles = getAllergenCircles();

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

          {/* Middle Row - Allergens (only if they exist) */}
          {allergenCircles.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {allergenCircles.map((allergen, index) => (
                <div 
                  key={index} 
                  title={`Contiene: ${allergen!.label}`}
                  className={`w-3 h-3 rounded-full ${allergen!.color} flex-shrink-0`}
                />
              ))}
            </div>
          )}

          {/* Bottom Row - Buttons in bottom right */}
          <div className="flex items-end justify-end">
            <div className="flex items-center gap-2 flex-shrink-0">
              <DishFavoriteButton
                dishId={dish.id}
                restaurantId={restaurantId}
                favoritesCount={dish.favorites_count}
                size="sm"
                className="bg-background/95 backdrop-blur-sm border-border/20 shadow-sm hover:bg-accent"
                savedFrom="menu_list"
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDishClick?.(dish);
                }}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                aria-label="Añadir plato"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
