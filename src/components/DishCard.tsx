
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import DishVariantsModal from './DishVariantsModal';
import DishInfoModal from './DishInfoModal';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useState } from 'react';

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

  const getTagStyle = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('chef') || tagLower.includes('recomendado')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
    }
    if (tagLower.includes('premiado') || tagLower.includes('premio')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
    }
    if (tagLower.includes('especialidad') || tagLower.includes('casa')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm';
    }
    if (tagLower.includes('nuevo') || tagLower.includes('novedad')) {
      return 'bg-red-50 text-red-700 border-red-200 shadow-sm';
    }
    if (tagLower.includes('popular') || tagLower.includes('favorito')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm';
    }
    return 'bg-muted/60 text-muted-foreground border-muted shadow-sm';
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
  const customTags = Array.isArray(dish.custom_tags) ? dish.custom_tags : [];

  return (
    <>
      <div 
        className={`bg-background cursor-pointer group transition-all duration-300 hover:bg-muted/30 ${
          !isFirstInSection ? 'border-t' : ''
        } border-b border-border/30 hover:border-border/50`}
        onClick={handleCardClick}
      >
        <div className="py-5 px-4 transition-all duration-300">
          <div className="flex gap-4 items-start w-full">
            
            {/* Content - Enhanced 2x2 Grid Layout */}
            <div className="flex-1 min-w-0 h-22">
              <div className="grid grid-rows-2 h-full gap-2">
                
                {/* First Row: Name (left) and Price (right) */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
                      {dish.name}
                    </h3>
                  </div>
                  <div className="font-bold text-lg text-primary text-right flex-shrink-0 transition-all duration-200 group-hover:scale-105">
                    {getDisplayPrice()}
                  </div>
                </div>

                {/* Second Row: Custom Tags (left) and Buttons (right) */}
                <div className="flex items-end justify-between">
                  <div className="flex-1 pr-4 min-w-0">
                    {/* Enhanced Custom Tags */}
                    {customTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {customTags.slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className={`text-xs px-2.5 py-1 h-6 font-medium transition-all duration-200 hover:shadow-md ${getTagStyle(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced Button Container */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <DishFavoriteButton
                      dishId={dish.id}
                      restaurantId={restaurantId}
                      favoritesCount={dish.favorites_count}
                      size="md"
                      className="border-0 bg-transparent hover:bg-muted/50 text-foreground w-9 h-9 transition-all duration-200 hover:scale-110"
                      savedFrom="menu_list"
                    />
                    
                    <button
                      onClick={handlePlusClick}
                      className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 text-white transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 group-hover:shadow-primary/25"
                      aria-label={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                      title={hasMultipleVariants ? "Seleccionar variante" : "Añadir al simulador"}
                    >
                      <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Enhanced Image - On the right */}
            <div className="flex-shrink-0">
              {dish.image_url ? (
                <div className="w-22 h-22 rounded-xl overflow-hidden relative shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <img
                    src={dish.image_url}
                    alt={dish.image_alt || dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {dish.is_featured && (
                    <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 shadow-lg border-2 border-background">
                      ★
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="w-22 h-22 bg-muted/40 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg border border-border/30">
                  <div className="text-muted-foreground text-xs text-center font-medium">Sin imagen</div>
                </div>
              )}
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
