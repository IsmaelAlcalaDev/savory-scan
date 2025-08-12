
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishImageModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DishImageModal({ dish, isOpen, onClose }: DishImageModalProps) {
  if (!dish) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{dish.name}</span>
            {dish.is_featured && (
              <Badge className="bg-accent text-accent-foreground">
                Destacado
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image */}
          {dish.image_url && (
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <img
                src={dish.image_url}
                alt={dish.image_alt || dish.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price information */}
          <div className="text-center">
            {dish.variants && dish.variants.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Opciones de precio:</h3>
                {dish.variants.map((variant) => (
                  <div key={variant.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded-lg">
                    <span className="font-medium">{variant.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl text-primary">
                        {formatPrice(variant.price)}
                      </span>
                      {variant.is_default && (
                        <Badge variant="outline">Por defecto</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-lg mb-2">Precio:</h3>
                <span className="font-bold text-3xl text-primary">
                  {formatPrice(dish.base_price)}
                </span>
              </div>
            )}
          </div>

          {/* Category */}
          {dish.category_name && (
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                {dish.category_name}
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
