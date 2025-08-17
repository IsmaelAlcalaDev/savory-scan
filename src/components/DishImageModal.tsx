
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

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
  if (!dish.image_url) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-auto p-0 bg-transparent border-none shadow-none">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Optimized Image */}
          <div className="relative rounded-lg overflow-hidden">
            <OptimizedImage
              src={dish.image_url}
              alt={dish.image_alt || dish.name}
              context="gallery"
              priority={true}
              className="w-full max-h-[85vh] object-cover"
              sizes="90vw"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
