
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
}

export default function DishCard({ dish, restaurantId }: DishCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);

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
      return `desde ${formatPrice(minPrice)}`;
    }
    return formatPrice(dish.base_price);
  };

  const handleAddVariantToOrder = (variantId: number, dinerId: string) => {
    if (dish.variants) {
      const variant = dish.variants.find(v => v.id === variantId);
      if (variant) {
        const modifiedDish = {
          ...dish,
          variants: dish.variants.map(v => ({
            ...v,
            is_default: v.id === variantId
          }))
        };
        addDishToOrder(modifiedDish, dinerId);
      }
    }
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const hasMultipleVariants = dish.variants && dish.variants.length > 1;
    
    if (hasMultipleVariants) {
      setIsVariantsModalOpen(true);
    } else {
      if (diners.length === 1) {
        addDishToOrder(dish, diners[0].id);
      } else {
        // For dishes without variants but multiple diners, we could show diner selection
        // For now, just add to first diner to keep it simple
        addDishToOrder(dish, diners[0].id);
      }
    }
  };

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;

  return (
    <>
      <div className="py-1.5 px-0 transition-colors">
        <div className="flex gap-2.5 items-start w-full">
          {/* Image */}
          <div className="flex-shrink-0">
            {dish.image_url ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden relative">
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
              <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
            {/* Top Row - Name and Price */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 pr-3">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                  {dish.name}
                </h3>
              </div>
              <div className="font-bold text-sm text-primary text-right flex-shrink-0">
                {getDisplayPrice()}
              </div>
            </div>

            {/* Bottom Row - Buttons */}
            <div className="flex items-end justify-end mt-auto">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <DishFavoriteButton
                  dishId={dish.id}
                  restaurantId={restaurantId}
                  favoritesCount={dish.favorites_count}
                  size="sm"
                  className="border-0 bg-transparent hover:bg-transparent text-foreground w-5 h-5"
                  savedFrom="menu_list"
                />
                
                <button
                  onClick={handlePlusClick}
                  className="w-5 h-5 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-sm"
                  aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                  title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Modal */}
      <DishVariantsModal
        isOpen={isVariantsModalOpen}
        onClose={() => setIsVariantsModalOpen(false)}
        dish={dish}
        onVariantAdd={handleAddVariantToOrder}
      />
    </>
  );
}
