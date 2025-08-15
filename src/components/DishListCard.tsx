
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import DietaryIcons from './DietaryIcons';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';
import { generateSpecialTags, generateDietaryIcons } from '@/utils/dishTagUtils';

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
  
  // Generate special tags and dietary icons using the new utility functions
  const specialTags = generateSpecialTags(dish);
  const dietaryIcons = generateDietaryIcons(dish);

  return (
    <>
      <div 
        className="border rounded-lg bg-background transition-colors cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex gap-2.5 items-start p-2.5">
          {/* Image - Always show, use placeholder if no image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden relative">
              <img
                src={dish.image_url || '/placeholder.svg'}
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

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between h-16">
            {/* Top Row - Special Tags */}
            {specialTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {specialTags.map((tag, index) => (
                  <Badge 
                    key={`${tag.type}-${index}`}
                    variant="outline"
                    className={`text-xs px-1.5 py-0.5 h-4 ${tag.style}`}
                  >
                    {tag.text}
                  </Badge>
                ))}
              </div>
            )}

            {/* Middle Row - Name and Price */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 pr-3 flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                  {dish.name}
                </h3>
              </div>
              <div className="font-bold text-sm text-primary text-right flex-shrink-0">
                {getDisplayPrice()}
              </div>
            </div>

            {/* Bottom Row - Dietary Icons and Buttons */}
            <div className="flex items-end justify-between mt-auto">
              <div className="flex-1">
                <DietaryIcons icons={dietaryIcons} size="sm" />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <DishFavoriteButton
                  dishId={dish.id}
                  restaurantId={restaurantId}
                  favoritesCount={dish.favorites_count}
                  size="md"
                  className="border-0 bg-transparent hover:bg-transparent text-foreground w-7 h-7"
                  savedFrom="menu_list"
                />
                
                <button
                  onClick={handlePlusClick}
                  className="w-7 h-7 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors flex items-center justify-center shadow-sm"
                  aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                  title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                >
                  <Plus className="h-3.5 w-3.5" />
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
