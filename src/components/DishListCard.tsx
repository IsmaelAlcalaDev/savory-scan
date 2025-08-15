
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';

interface DishListCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
}

export default function DishListCard({ dish, restaurantId }: DishListCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const hasMultipleVariants = dish.variants && dish.variants.length > 1;
    
    if (hasMultipleVariants) {
      setIsVariantsModalOpen(true);
    } else {
      if (diners.length === 1) {
        addDishToOrder(dish, diners[0].id);
      } else {
        addDishToOrder(dish, diners[0].id);
      }
    }
  };

  const handleCardClick = () => {
    const hasMultipleVariants = dish.variants && dish.variants.length > 1;
    
    if (hasMultipleVariants) {
      setIsVariantsModalOpen(true);
    } else {
      setIsInfoModalOpen(true);
    }
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

  const handleDishAdd = (dinerId: string) => {
    addDishToOrder(dish, dinerId);
  };

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;

  return (
    <>
      <div 
        className="border rounded-lg bg-background transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex gap-2 items-center p-2">
          {/* Content - takes available space */}
          <div className="flex-1 min-w-0">
            {/* Name - takes full width up to image */}
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 pr-2">
              {dish.name}
            </h3>
            
            {/* Bottom row with price and buttons */}
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm text-primary">
                {getDisplayPrice()}
              </div>
              
              <div className="flex items-center gap-1">
                <DishFavoriteButton
                  dishId={dish.id}
                  restaurantId={restaurantId}
                  favoritesCount={dish.favorites_count}
                  size="sm"
                  className="border-0 bg-transparent hover:bg-transparent text-foreground w-6 h-6"
                  savedFrom="menu_list"
                />
                
                <button
                  onClick={handlePlusClick}
                  className="w-6 h-6 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-sm"
                  aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                  title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Image */}
          {dish.image_url && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden relative">
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
            </div>
          )}
        </div>
      </div>

      {/* Variants Modal */}
      <DishVariantsModal
        isOpen={isVariantsModalOpen}
        onClose={() => setIsVariantsModalOpen(false)}
        dish={dish}
        onVariantAdd={handleAddVariantToOrder}
      />

      {/* Info Modal for dishes without variants */}
      <DishInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        dish={dish}
        onDishAdd={handleDishAdd}
      />
    </>
  );
}
