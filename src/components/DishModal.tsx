
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Leaf, Wheat, Milk, Heart, Flame, Clock, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import FavoriteButton from './FavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DishModalProps {
  dish: Dish | null;
  restaurantId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function DishModal({ dish, restaurantId, isOpen, onClose }: DishModalProps) {
  const { addDishToOrder, diners, openDinersModal } = useOrderSimulator();
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedDinerId, setSelectedDinerId] = useState<string | null>(null);

  if (!dish) return null;

  const getDietIcon = (dish: Dish) => {
    const icons = [];
    if (dish.is_vegetarian) icons.push({ icon: Leaf, label: 'Vegetariano', color: 'text-green-500' });
    if (dish.is_vegan) icons.push({ icon: Leaf, label: 'Vegano', color: 'text-green-600' });
    if (dish.is_gluten_free) icons.push({ icon: Wheat, label: 'Sin gluten', color: 'text-amber-500' });
    if (dish.is_lactose_free) icons.push({ icon: Milk, label: 'Sin lactosa', color: 'text-blue-500' });
    if (dish.is_healthy) icons.push({ icon: Heart, label: 'Saludable', color: 'text-red-500' });
    return icons;
  };

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null;
    return Array.from({ length: level }, (_, i) => (
      <Flame key={i} className="h-4 w-4 text-red-500 fill-current" />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const hasVariants = dish.variants && dish.variants.length > 1;
  const defaultVariant = dish.variants?.find(v => v.is_default);
  const selectedVariant = selectedVariantId 
    ? dish.variants?.find(v => v.id === selectedVariantId)
    : defaultVariant || dish.variants?.[0];

  const handleAddToOrder = () => {
    let targetDinerId = selectedDinerId;
    
    // If no diner selected and only one diner, use that one
    if (!targetDinerId && diners.length === 1) {
      targetDinerId = diners[0].id;
    }
    
    // If still no diner selected, don't proceed
    if (!targetDinerId) {
      return;
    }

    // Create dish copy with selected variant
    const dishToAdd = { ...dish };
    if (selectedVariant) {
      dishToAdd.variants = [selectedVariant];
    }

    addDishToOrder(dishToAdd, targetDinerId);
    onClose();
  };

  const canAddToOrder = diners.length === 1 || selectedDinerId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-bold pr-8">{dish.name}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {dish.image_url && (
            <div className="aspect-[16/9] overflow-hidden rounded-lg">
              <img
                src={dish.image_url}
                alt={dish.image_alt || dish.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {dish.is_featured && (
              <Badge className="bg-accent text-accent-foreground">
                Destacado
              </Badge>
            )}
            {dish.category_name && (
              <Badge variant="outline">
                {dish.category_name}
              </Badge>
            )}
          </div>

          {/* Description */}
          {dish.description && (
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed">{dish.description}</p>
            </div>
          )}

          {/* Diet and Health Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Información nutricional</h3>
            <div className="flex items-center gap-4 flex-wrap">
              {getDietIcon(dish).map(({ icon: Icon, label, color }, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
              {dish.spice_level > 0 && (
                <div className="flex items-center gap-2">
                  <span>Nivel de picante:</span>
                  <div className="flex items-center gap-1">
                    {getSpiceLevel(dish.spice_level)}
                  </div>
                </div>
              )}

              {dish.preparation_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Tiempo de preparación: {dish.preparation_time_minutes} min</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Variant Selection */}
          {hasVariants && (
            <div className="space-y-4">
              <h3 className="font-semibold">Selecciona el tamaño</h3>
              <div className="space-y-2">
                {dish.variants.map((variant) => (
                  <div 
                    key={variant.id} 
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedVariantId === variant.id || (!selectedVariantId && variant.is_default)
                        ? 'bg-primary/10 border-2 border-primary' 
                        : 'bg-secondary/20 hover:bg-secondary/30 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{variant.name}</span>
                      {variant.is_default && !selectedVariantId && (
                        <Badge variant="outline" className="text-xs">
                          Por defecto
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold text-primary text-lg">
                      {formatPrice(variant.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Price Display */}
          {!hasVariants && (
            <div className="space-y-4">
              <h3 className="font-semibold">Precio</h3>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <span className="font-medium">Precio</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(dish.base_price)}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Diner Selection (if multiple diners) */}
          {diners.length > 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Asignar a comensal</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedDinerId 
                      ? diners.find(d => d.id === selectedDinerId)?.name 
                      : "Seleccionar comensal"
                    }
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2">
                  <div className="space-y-1">
                    {diners.map((diner) => (
                      <Button
                        key={diner.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDinerId(diner.id)}
                        className="w-full justify-start h-8"
                      >
                        {diner.name}
                      </Button>
                    ))}
                    <hr className="my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openDinersModal}
                      className="w-full justify-start h-8 text-primary"
                    >
                      Gestionar comensales
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <FavoriteButton
              restaurantId={restaurantId}
              favoritesCount={dish.favorites_count}
              savedFrom="dish_modal"
              size="md"
            />
            
            <Button 
              size="lg" 
              className="gap-2"
              onClick={handleAddToOrder}
              disabled={!canAddToOrder}
            >
              Añadir al pedido
              {selectedVariant && (
                <span className="font-bold">
                  {formatPrice(selectedVariant.price)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
