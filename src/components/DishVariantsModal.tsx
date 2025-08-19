
import React from 'react';
import { Plus, X } from 'lucide-react';
import {
  ModalWrapper,
  ModalContent,
} from '@/components/ui/modal-wrapper';
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

  if (!dish.variants || dish.variants.length <= 1) {
    return null;
  }

  return (
    <ModalWrapper open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 rounded-xl border-0 shadow-lg">
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-black/20 backdrop-blur-sm p-1.5 text-white hover:bg-black/30 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Large Dish Image */}
        {dish.image_url && (
          <div className="w-full h-44 overflow-hidden">
            <img
              src={dish.image_url}
              alt={dish.image_alt || dish.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content Container */}
        <div className="p-4 pt-3">
          {/* Dish Info */}
          <div className="mb-3">
            <h3 className="font-bold text-lg mb-1">{dish.name}</h3>
            {dish.description && (
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{dish.description}</p>
            )}
          </div>

          {/* Diet and Allergen Tags */}
          {(getDietBadges().length > 0 || (dish.allergens && dish.allergens.length > 0) || getSpiceIcons()) && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {getDietBadges().map((badge, index) => (
                  <span key={index} className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
                    {badge.label}
                  </span>
                ))}
                
                {dish.allergens && dish.allergens.map((allergen, index) => (
                  <span key={index} className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                    {allergen}
                  </span>
                ))}
                
                {getSpiceIcons() && (
                  <span className="text-base">{getSpiceIcons()}</span>
                )}
              </div>
            </div>
          )}

          {/* Preparation Time */}
          {dish.preparation_time_minutes && (
            <div className="text-xs text-muted-foreground mb-3">
              <span className="font-medium">Tiempo de preparación:</span> {dish.preparation_time_minutes} min
            </div>
          )}

          {/* Variants List */}
          <div className="space-y-2">
            {dish.variants.map((variant) => (
              <div key={variant.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5">
                <div className="flex-1">
                  <span className="font-medium text-sm">{variant.name}</span>
                  {variant.is_default && (
                    <span className="ml-2 text-xs text-muted-foreground">(Estándar)</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
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
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}
