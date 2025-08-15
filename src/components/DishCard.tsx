import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import DishPrice from './DishPrice';
import type { Dish } from '@/hooks/useRestaurantMenu';
import type { Promotion } from '@/hooks/usePromotions';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
  isFirstInSection?: boolean;
  promotions: Promotion[];
  getPromotionForDish: (dishId: number, sectionId?: number) => Promotion | undefined;
  calculateDiscountedPrice: (originalPrice: number, promotion: Promotion) => number;
}

export default function DishCard({ 
  dish, 
  restaurantId, 
  expandedDishId, 
  onExpandedChange, 
  isFirstInSection = false,
  promotions,
  getPromotionForDish,
  calculateDiscountedPrice
}: DishCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const isExpanded = expandedDishId === dish.id;

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleExpandToggle = () => {
    onExpandedChange(isExpanded ? null : dish.id);
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
  const hasDescription = dish.description && dish.description.trim().length > 0;

  const isLongDescription = hasDescription && dish.description!.length > 120;

  return (
    <>
      <div 
        className={`border-b bg-background transition-colors cursor-pointer ${
          isFirstInSection ? '' : 'border-t-0'
        }`}
        onClick={handleCardClick}
      >
        <div className="flex gap-4 items-start p-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Top Row - Name and expand button */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 pr-3">
                <h3 className="font-semibold text-base text-foreground line-clamp-2">
                  {dish.name}
                </h3>
                {dish.is_featured && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-1 py-0 ml-2">
                    ★
                  </Badge>
                )}
              </div>
              
              {/* Only show expand button if there's a description */}
              {hasDescription && isLongDescription && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandToggle();
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
                  aria-label={isExpanded ? "Contraer descripción" : "Expandir descripción"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Description */}
            {hasDescription && (
              <div className="mb-3">
                <p className={`text-muted-foreground text-sm leading-relaxed ${
                  isLongDescription && !isExpanded ? 'line-clamp-2' : ''
                }`}>
                  {dish.description}
                </p>
              </div>
            )}

            {/* Bottom Row - Price and Actions */}
            <div className="flex items-center justify-between">
              <DishPrice 
                originalPrice={displayPrice}
                dishId={dish.id}
                restaurantId={restaurantId}
                sectionId={dish.section_id}
                promotions={promotions}
                getPromotionForDish={getPromotionForDish}
                calculateDiscountedPrice={calculateDiscountedPrice}
                className="font-bold text-base text-primary"
              />
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <DishFavoriteButton
                    dishId={dish.id}
                    restaurantId={restaurantId}
                    favoritesCount={dish.favorites_count}
                    size="md"
                    className="border-0 bg-transparent hover:bg-transparent text-foreground w-8 h-8"
                    savedFrom="menu_full"
                  />
                  
                  <button
                    onClick={handlePlusClick}
                    className="w-8 h-8 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-sm"
                    aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                    title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-shrink-0">
            {dish.image_url ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden relative">
                <img
                  src={dish.image_url}
                  alt={dish.image_alt || dish.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-muted/50 rounded-lg flex items-center justify-center">
                <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
              </div>
            )}
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
        onClose={() => setIsInfoModalOpen(false)}
        dish={dish}
        onDishAdd={handleDishAdd}
      />
    </>
  );
}
