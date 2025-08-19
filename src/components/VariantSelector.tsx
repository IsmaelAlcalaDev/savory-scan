import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import type { Dish } from '@/types/dish';

interface VariantSelectorProps {
  dish: Dish;
  onVariantSelect: (variantId: number | null) => void;
}

export default function VariantSelector({ dish, onVariantSelect }: VariantSelectorProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const hasVariants = dish.variants && dish.variants.length > 1;

  if (!hasVariants) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-xs h-8"
          onClick={(e) => e.stopPropagation()}
        >
          Ver tamaños
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 z-50" align="center">
        <div className="space-y-2">
          <div className="px-1 py-1 text-sm font-medium text-foreground border-b pb-2">
            Selecciona el tamaño:
          </div>
          {dish.variants.map((variant) => (
            <Button
              key={variant.id}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onVariantSelect(variant.id);
              }}
              className="w-full justify-between h-auto py-2 px-3 text-left"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">{variant.name}</span>
                {variant.is_default && (
                  <span className="text-xs text-muted-foreground">Tamaño estándar</span>
                )}
              </div>
              <span className="font-semibold text-primary">
                {formatPrice(variant.price)}
              </span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
