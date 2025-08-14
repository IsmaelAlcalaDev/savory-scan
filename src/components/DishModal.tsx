
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Leaf, Wheat, Milk, Heart, Flame, Clock, X } from 'lucide-react';
import DishFavoriteButton from './DishFavoriteButton';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishModalProps {
  dish: Dish | null;
  restaurantId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function DishModal({ dish, restaurantId, isOpen, onClose }: DishModalProps) {
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

          {/* Variants and Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold">Precios</h3>
            {dish.variants && dish.variants.length > 0 ? (
              <div className="space-y-3">
                {dish.variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{variant.name}</span>
                      {variant.is_default && (
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
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                <span className="font-medium">Precio</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(dish.base_price)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <DishFavoriteButton
              dishId={dish.id}
              favoritesCount={dish.favorites_count}
              savedFrom="dish_modal"
              size="md"
            />
            
            <Button size="lg" className="gap-2">
              Añadir al pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
