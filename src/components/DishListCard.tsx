
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import DishPrice from './DishPrice';
import type { Dish } from '@/hooks/useRestaurantMenu';
import type { Promotion } from '@/hooks/usePromotions';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';

interface DishListCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
  promotions?: Promotion[];
  getPromotionForDish?: (dishId: number, sectionId?: number) => Promotion | undefined;
  calculateDiscountedPrice?: (originalPrice: number, promotion: Promotion) => number;
}

export default function DishListCard({ 
  dish, 
  restaurantId,
  promotions = [],
  getPromotionForDish = () => undefined,
  calculateDiscountedPrice = (price) => price
}: DishListCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const getDisplayPrice = () => {
    if (dish.variants && dish.variants.length > 0) {
      const defaultVariant = dish.variants.find(v => v.is_default);
      if (defaultVariant) {
        return defaultVariant.price;
      }
      const minPrice = Math.min(...dish.variants.map(v => v.price));
      const maxPrice = Math.max(...dish.variants.map(v => v.price));
      if (minPrice === maxPrice) {
        return minPrice;
      }
      return minPrice; // Para promociones, usamos el precio mínimo
    }
    return dish.base_price;
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
  const displayPrice = getDisplayPrice();

  return (
    <>
      <div 
        className="border rounded-lg bg-background transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex gap-2.5 items-center p-2.5">
          {/* Image */}
          <div className="flex-shrink-0">
            {dish.image_url ? (
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
            ) : (
              <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center justify-between">
            {/* Name */}
            <div className="flex items-center gap-2 pr-3">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                {dish.name}
              </h3>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <DishPrice 
                originalPrice={displayPrice}
                dishId={dish.id}
                restaurantId={restaurantId}
                sectionId={dish.section_id}
                promotions={promotions}
                getPromotionForDish={getPromotionForDish}
                calculateDiscountedPrice={calculateDiscountedPrice}
                className="font-bold text-sm text-primary text-right"
              />
              
              <DishFavoriteButton
                dishId={dish.id}
                restaurantId={restaurantId}
                favoritesCount={dish.favorites_count}
                size="md"
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
        onClose={() => setIsInfoModal
        dish={dish}
        onDishAdd={handleDishAdd}
      />
    </>
  );
}
