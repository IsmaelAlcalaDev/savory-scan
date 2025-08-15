
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

  const getTagStyle = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('chef') || tagLower.includes('recomendado')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (tagLower.includes('premiado') || tagLower.includes('premio')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (tagLower.includes('especialidad') || tagLower.includes('casa')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (tagLower.includes('nuevo') || tagLower.includes('novedad')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (tagLower.includes('popular') || tagLower.includes('favorito')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
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
        addDishToOrder(dish, diners[0].id);
      }
    }
  };

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;
  const customTags = Array.isArray(dish.custom_tags) ? dish.custom_tags : [];

  return (
    <>
      <div className="border-t border-b border-border/50">
        <div className="py-4 px-0 transition-colors">
          <div className="flex gap-3 items-start w-full">
            {/* Image */}
            <div className="flex-shrink-0">
              {dish.image_url ? (
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
              ) : (
                <div className="w-20 h-20 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
              {/* Top Row - Name and Price */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1.5 pr-3 min-w-0">
                  <h3 className="font-semibold text-base text-foreground line-clamp-2">
                    {dish.name}
                  </h3>
                  {/* Custom Tags */}
                  {customTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {customTags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index}
                          variant="outline"
                          className={`text-xs px-2 py-0.5 h-5 ${getTagStyle(tag)}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="font-bold text-base text-primary text-right flex-shrink-0">
                  {getDisplayPrice()}
                </div>
              </div>

              {/* Bottom Row - Buttons */}
              <div className="flex items-end justify-end mt-auto">
                <div className="flex items-center gap-2 flex-shrink-0">
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
