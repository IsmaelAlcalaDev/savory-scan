
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
}

export default function DishCard({ dish, restaurantId }: DishCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [isExpanded, setIsExpanded] = useState(false);

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
      // Expand to show variants
      setIsExpanded(!isExpanded);
    } else {
      // Add directly to simulator with default behavior
      if (diners.length === 1) {
        addDishToOrder(dish, diners[0].id);
      } else {
        // If multiple diners, expand to show diner selector
        setIsExpanded(!isExpanded);
      }
    }
  };

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddVariantToOrder = (variantId: number | null, dinerId: string) => {
    if (variantId && dish.variants) {
      const variant = dish.variants.find(v => v.id === variantId);
      if (variant) {
        // Create a modified dish with the selected variant as default
        const modifiedDish = {
          ...dish,
          variants: dish.variants.map(v => ({
            ...v,
            is_default: v.id === variantId
          }))
        };
        addDishToOrder(modifiedDish, dinerId);
      }
    } else {
      addDishToOrder(dish, dinerId);
    }
  };

  const handleDinerSelect = (dinerId: string) => {
    addDishToOrder(dish, dinerId);
    setIsExpanded(false);
  };

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;
  const hasMultipleDiners = diners.length > 1;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="py-3 px-0 hover:bg-accent/30 transition-colors">
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
          <div className="flex-1 min-w-0 flex flex-col justify-between h-20 cursor-pointer" onClick={handleCardClick}>
            {/* Top Row - Name and Price */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2 pr-4">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                  {dish.name}
                </h3>
              </div>
              <div className="font-bold text-base text-primary text-right flex-shrink-0">
                {getDisplayPrice()}
              </div>
            </div>

            {/* Middle Row - Description */}
            {dish.description && (
              <div className="mb-1">
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {dish.description}
                </p>
              </div>
            )}

            {/* Bottom Row - Buttons */}
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
                  onClick={handlePlusClick}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                  aria-label="Añadir al simulador"
                  title="Añadir al simulador"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>

                {/* Expand indicator */}
                <CollapsibleTrigger asChild>
                  <button
                    className="w-7 h-7 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center"
                    aria-label={isExpanded ? "Contraer información" : "Expandir información"}
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </CollapsibleTrigger>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <CollapsibleContent className="mt-3">
          <div className="ml-23 space-y-3 bg-accent/20 rounded-lg p-4">
            {/* Description */}
            {dish.description && (
              <div>
                <h4 className="font-medium text-sm mb-1">Descripción</h4>
                <p className="text-sm text-muted-foreground">{dish.description}</p>
              </div>
            )}

            {/* Variants Selection */}
            {hasMultipleVariants && (
              <div>
                <h4 className="font-medium text-sm mb-2">Selecciona tamaño:</h4>
                <div className="space-y-2">
                  {dish.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between bg-background rounded-lg p-3">
                      <div>
                        <span className="font-medium text-sm">{variant.name}</span>
                        {variant.is_default && (
                          <span className="ml-2 text-xs text-muted-foreground">(Estándar)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">
                          {formatPrice(variant.price)}
                        </span>
                        {hasMultipleDiners ? (
                          <DinerSelector
                            onDinerSelect={(dinerId) => handleAddVariantToOrder(variant.id, dinerId)}
                            onManageDiners={openDinersModal}
                          />
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddVariantToOrder(variant.id, diners[0].id)}
                            className="h-8"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Añadir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diner Selection for dishes without variants */}
            {!hasMultipleVariants && hasMultipleDiners && (
              <div>
                <h4 className="font-medium text-sm mb-2">Asignar a comensal:</h4>
                <DinerSelector
                  onDinerSelect={handleDinerSelect}
                  onManageDiners={openDinersModal}
                />
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              {dish.preparation_time_minutes && (
                <div>
                  <span className="font-medium">Tiempo:</span> {dish.preparation_time_minutes} min
                </div>
              )}
              {dish.spice_level > 0 && (
                <div>
                  <span className="font-medium">Picante:</span> {'🌶️'.repeat(dish.spice_level)}
                </div>
              )}
              {dish.is_vegetarian && (
                <div>
                  <span className="font-medium text-green-600">🌱 Vegetariano</span>
                </div>
              )}
              {dish.is_vegan && (
                <div>
                  <span className="font-medium text-green-600">🌿 Vegano</span>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
