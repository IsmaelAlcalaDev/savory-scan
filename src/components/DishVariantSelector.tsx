import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DinerSelector from './DinerSelector';
import type { Dish } from '@/types/dish';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface DishVariantSelectorProps {
  dish: Dish;
  onVariantAdd: (variantId: number, dinerId: string) => void;
}

export default function DishVariantSelector({ dish, onVariantAdd }: DishVariantSelectorProps) {
  const { diners, openDinersModal } = useOrderSimulator();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const hasMultipleDiners = diners.length > 1;

  if (!dish.variants || dish.variants.length <= 1) {
    return null;
  }

  return (
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
                  onDinerSelect={(dinerId) => onVariantAdd(variant.id, dinerId)}
                  onManageDiners={openDinersModal}
                />
              ) : (
                <Button
                  size="sm"
                  onClick={() => onVariantAdd(variant.id, diners[0].id)}
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
  );
}
