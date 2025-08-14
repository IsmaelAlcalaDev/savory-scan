
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface DishImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: {
    name: string;
    image_url?: string;
    image_alt?: string;
    base_price?: number;
    variants?: Array<{ price: number; is_default?: boolean }>;
  };
}

export default function DishImageModal({ isOpen, onClose, dish }: DishImageModalProps) {
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
      return `desde ${formatPrice(minPrice)}`;
    }
    return formatPrice(dish.base_price || 0);
  };

  if (!dish.image_url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full max-w-3xl max-h-[80vh] mx-auto">
            <img
              src={dish.image_url}
              alt={dish.image_alt || dish.name}
              className="w-full h-full object-contain rounded-lg"
            />
            
            {/* Overlay with title and price */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 rounded-b-lg">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {dish.name}
              </h2>
              <div className="text-xl md:text-2xl font-bold text-primary drop-shadow-lg">
                {getDisplayPrice()}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
