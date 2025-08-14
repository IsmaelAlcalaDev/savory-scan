import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DishFavoriteButton from './DishFavoriteButton';
import DinerSelector from './DinerSelector';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
}

export default function DishCard({ dish, restaurantId, expandedDishId, onExpandedChange }: DishCardProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const isExpanded = expandedDishId === dish.id;

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

  const handleCardClick = () => {
    onExpandedChange(isExpanded ? null : dish.id);
  };

  const handleAddVariantToOrder = (variantId: number | null, dinerId: string) => {
    if (variantId && dish.variants) {
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
    } else {
      addDishToOrder(dish, dinerId);
    }
  };

  const handleDinerSelect = (dinerId: string) => {
    addDishToOrder(dish, dinerId);
    onExpandedChange(null);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const hasMultipleVariants = dish.variants && dish.variants.length > 1;
    
    if (hasMultipleVariants) {
      onExpandedChange(isExpanded ? null : dish.id);
    } else {
      if (diners.length === 1) {
        addDishToOrder(dish, diners[0].id);
      } else {
        onExpandedChange(isExpanded ? null : dish.id);
      }
    }
  };

  const getDietBadges = () => {
    const badges = [];
    if (dish.is_vegetarian) badges.push({ label: 'Vegetariano', color: 'bg-green-100 text-green-800' });
    if (dish.is_vegan) badges.push({ label: 'Vegano', color: 'bg-green-100 text-green-800' });
    if (dish.is_gluten_free) badges.push({ label: 'Sin gluten', color: 'bg-blue-100 text-blue-800' });
    if (dish.is_lactose_free) badges.push({ label: 'Sin lactosa', color: 'bg-purple-100 text-purple-800' });
    if (dish.is_healthy) badges.push({ label: 'Saludable', color: 'bg-emerald-100 text-emerald-800' });
    return badges;
  };

  const getSpiceIcons = () => {
    const spiceLevel = dish.spice_level;
    if (spiceLevel === 0) return null;
    return '🌶️'.repeat(Math.min(spiceLevel, 5));
  };

  const hasMultipleVariants = dish.variants && dish.variants.length > 1;
  const hasMultipleDiners = diners.length > 1;

  return (
    <Collapsible open={isExpanded} onOpenChange={(open) => onExpandedChange(open ? dish.id : null)}>
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

            {/* Bottom Row - Buttons */}
            <div className="flex items-end justify-end mt-auto">
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
                  className={`w-7 h-7 rounded-full ${hasMultipleVariants ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'} text-white transition-colors flex items-center justify-center shadow-sm`}
                  aria-label={hasMultipleVariants ? "Ver variantes" : "Añadir al simulador"}
                  title={hasMultipleVariants ? "Ver variantes" : "Añadir al simulador"}
                >
                  {hasMultipleVariants ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <CollapsibleContent className="mt-3">
          <div className="ml-23 space-y-3 bg-accent/20 rounded-lg p-3">
            {/* Description */}
            {dish.description && (
              <p className="text-sm text-muted-foreground">{dish.description}</p>
            )}

            {/* Diet and Allergen Tags */}
            <div className="space-y-2">
              {getDietBadges().length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getDietBadges().map((badge, index) => (
                    <span key={index} className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}

              {dish.allergens && dish.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dish.allergens.map((allergen, index) => (
                    <span key={index} className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      {allergen}
                    </span>
                  ))}
                </div>
              )}

              {getSpiceIcons() && (
                <div className="text-lg">{getSpiceIcons()}</div>
              )}
            </div>

            {/* Variants Selection */}
            {hasMultipleVariants && (
              <div>
                <div className="space-y-1.5">
                  {dish.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between bg-background rounded-lg p-2">
                      <div>
                        <span className="font-medium text-sm">{variant.name}</span>
                        {variant.is_default && (
                          <span className="ml-2 text-xs text-muted-foreground">(Estándar)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary text-sm">
                          {formatPrice(variant.price)}
                        </span>
                        {hasMultipleDiners ? (
                          <DinerSelector
                            onDinerSelect={(dinerId) => handleAddVariantToOrder(variant.id, dinerId)}
                            onManageDiners={openDinersModal}
                          />
                        ) : (
                          <button
                            onClick={() => handleAddVariantToOrder(variant.id, diners[0].id)}
                            className="w-7 h-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                            aria-label="Añadir variante"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
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
            {dish.preparation_time_minutes && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Tiempo:</span> {dish.preparation_time_minutes} min
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
