import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';
import { generatePriorityTags } from '@/utils/dishTagUtils';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
  isFirstInSection?: boolean;
}

export default function DishCard({ 
  dish, 
  restaurantId, 
  isFirstInSection = false 
}: DishCardProps) {
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

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;
  const hasImage = Boolean(dish.image_url);
  
  // Generate priority tags using the new utility
  const priorityTags = generatePriorityTags(dish);

  return (
    <div className="w-full">
      {/* Full-width divider above each dish (except first in section) */}
      {!isFirstInSection && (
        <div className="w-full h-px bg-gray-200"></div>
      )}
      
      <div 
        className="bg-white cursor-pointer w-full"
        onClick={handleCardClick}
      >
        <div className="py-4 px-4 transition-colors hover:bg-gray-50 w-full">
          <div className="flex gap-3 items-start w-full">
            {/* Content - Responsive width based on image presence */}
            <div className={`min-w-0 h-20 ${hasImage ? 'flex-1' : 'w-full'}`}>
              {/* Grid container with 2 rows */}
              <div className="grid grid-rows-2 h-full gap-1">
                
                {/* First Row: Name (left) and Price (right) */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-3 min-w-0">
                    <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-1">
                      {dish.name}
                    </h3>
                  </div>
                  <div className="font-bold text-sm md:text-lg text-primary text-right flex-shrink-0">
                    {getDisplayPrice()}
                  </div>
                </div>

                {/* Second Row: Priority Tags (left) and Buttons (right) */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 pr-3">
                    {/* Priority Tags - Show up to 3 tags */}
                    {priorityTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {priorityTags.map((tag, index) => (
                          <Badge 
                            key={`${tag.type}-${index}`}
                            variant="outline"
                            className={`text-xs px-2 py-0.5 h-5 ${tag.style}`}
                          >
                            {tag.text}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DishFavoriteButton
                      dishId={dish.id}
                      restaurantId={restaurantId}
                      favoritesCount={dish.favorites_count}
                      size="md"
                      className="border-0 bg-transparent hover:bg-transparent text-foreground w-7 h-7 md:w-8 md:h-8"
                      savedFrom="menu_list"
                    />
                    
                    <button
                      onClick={handlePlusClick}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-sm"
                      aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                      title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                    >
                      <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Image - Only show if exists */}
            {hasImage && (
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-lg overflow-hidden relative">
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
    </div>
  );
}
