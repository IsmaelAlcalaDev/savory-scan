
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import DishFavoriteButton from './DishFavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  onDishClick?: (dish: Dish) => void;
}

// Mapping of common allergen slugs to colors
const allergenColorMap: Record<string, { color: string; label: string }> = {
  'gluten': { color: 'bg-amber-500', label: 'Gluten' },
  'dairy': { color: 'bg-blue-500', label: 'Lácteos' },
  'lactose': { color: 'bg-blue-400', label: 'Lactosa' },
  'fish': { color: 'bg-cyan-500', label: 'Pescado' },
  'shellfish': { color: 'bg-teal-500', label: 'Mariscos' },
  'eggs': { color: 'bg-yellow-500', label: 'Huevos' },
  'nuts': { color: 'bg-orange-600', label: 'Frutos secos' },
  'peanuts': { color: 'bg-orange-500', label: 'Cacahuetes' },
  'soy': { color: 'bg-green-600', label: 'Soja' },
  'sesame': { color: 'bg-amber-600', label: 'Sésamo' }
};

export default function DishCard({ dish, restaurantId, onDishClick }: DishCardProps) {
  const { addDishToOrder, openDinersModal, diners } = useOrderSimulator();
  const [showDinerSelector, setShowDinerSelector] = useState(false);

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
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(dish.base_price);
  };

  // Get allergen circles (limit to 6 most important ones)
  const getAllergenCircles = () => {
    if (!dish.allergens || !Array.isArray(dish.allergens)) return [];
    
    return dish.allergens
      .slice(0, 6)
      .map((allergen: string) => {
        const allergenInfo = allergenColorMap[allergen.toLowerCase()];
        if (allergenInfo) {
          return {
            color: allergenInfo.color,
            label: allergenInfo.label,
            slug: allergen
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const handleAddToSimulator = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Si solo hay un comensal, añadir directamente
    if (diners.length === 1) {
      addDishToOrder(dish, diners[0].id);
      return;
    }
    
    // Si hay múltiples comensales, mostrar selector
    setShowDinerSelector(true);
  };

  const handleDinerSelect = (dinerId: string) => {
    addDishToOrder(dish, dinerId);
    setShowDinerSelector(false);
  };

  const handleManageDiners = () => {
    setShowDinerSelector(false);
    openDinersModal();
  };

  const allergenCircles = getAllergenCircles();

  return (
    <div 
      className="py-4 px-0 hover:bg-accent/30 transition-colors cursor-pointer" 
      onClick={() => onDishClick?.(dish)}
    >
      <div className="flex gap-4 items-start w-full">
        {/* Image */}
        <div className="flex-shrink-0">
          {dish.image_url ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden relative">
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
            <div className="w-24 h-24 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground text-xs text-center">Sin imagen</div>
            </div>
          )}
        </div>

        {/* Content - Full Width */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
          {/* Top Row - Name and Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-base text-foreground line-clamp-2 pr-4">
              {dish.name}
            </h3>
            <div className="font-bold text-lg text-primary text-right flex-shrink-0">
              {getDisplayPrice()}
            </div>
          </div>

          {/* Middle Row - Diner Selector (si está activo) y Allergens */}
          <div className="flex items-center gap-3 mb-2">
            {/* Diner Selector - aparece delante de los alérgenos */}
            {showDinerSelector && diners.length > 1 && (
              <div className="flex-shrink-0">
                <Popover open={showDinerSelector} onOpenChange={setShowDinerSelector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-background border-primary/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Seleccionar comensal
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 z-50" align="start">
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Asignar plato a:
                      </div>
                      {diners.map((diner) => (
                        <Button
                          key={diner.id}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDinerSelect(diner.id);
                          }}
                          className="w-full justify-start h-7 text-xs"
                        >
                          {diner.name}
                        </Button>
                      ))}
                      <hr className="my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManageDiners();
                        }}
                        className="w-full justify-start h-7 text-xs text-primary"
                      >
                        Gestionar comensales
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Allergens (only if they exist and no diner selector showing) */}
            {allergenCircles.length > 0 && (
              <div className="flex items-center gap-2">
                {allergenCircles.map((allergen, index) => (
                  <div 
                    key={index} 
                    title={`Contiene: ${allergen!.label}`}
                    className={`w-3 h-3 rounded-full ${allergen!.color} flex-shrink-0`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Row - Buttons in bottom right */}
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
                onClick={handleAddToSimulator}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center shadow-sm"
                aria-label="Añadir al simulador"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
