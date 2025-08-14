
import React from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import DinerSelector from './DinerSelector';
import type { Dish } from '@/hooks/useRestaurantMenu';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface DishVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish;
  onVariantAdd: (variantId: number, dinerId: string) => void;
}

export default function DishVariantsModal({ isOpen, onClose, dish, onVariantAdd }: DishVariantsModalProps) {
  const { diners, openDinersModal } = useOrderSimulator();
  const hasMultipleDiners = diners.length > 1;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (!dish.variants || dish.variants.length <= 1) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Selecciona el tamaño</DialogTitle>
        </DialogHeader>

        {/* Dish Info */}
        <div className="flex gap-3 mb-4">
          {dish.image_url && (
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={dish.image_url}
                alt={dish.image_alt || dish.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">{dish.name}</h3>
            {dish.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{dish.description}</p>
            )}
          </div>
        </div>

        {/* Variants List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {dish.variants.map((variant) => (
            <div key={variant.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <div>
                <span className="font-medium text-sm">{variant.name}</span>
                {variant.is_default && (
                  <span className="ml-2 text-xs text-muted-foreground">(Estándar)</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary text-sm">
                  {formatPrice(variant.price)}
                </span>
                {hasMultipleDiners ? (
                  <DinerSelector
                    onDinerSelect={(dinerId) => {
                      onVariantAdd(variant.id, dinerId);
                      onClose();
                    }}
                    onManageDiners={openDinersModal}
                  />
                ) : (
                  <button
                    onClick={() => {
                      onVariantAdd(variant.id, diners[0].id);
                      onClose();
                    }}
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
      </DialogContent>
    </Dialog>
  );
}
