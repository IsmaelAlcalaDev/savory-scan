
import React from 'react';
import { X, Users, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal-wrapper';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

interface OrderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderSimulatorModal({ isOpen, onClose }: OrderSimulatorModalProps) {
  const {
    diners,
    orderItems,
    updateItemQuantity,
    removeDishFromOrder,
    getTotalByDiner,
    getGrandTotal,
    clearSimulator,
    openDinersModal
  } = useOrderSimulator();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getDinerItems = (dinerId: string) => {
    return orderItems.filter(item => item.dinerId === dinerId);
  };

  return (
    <ModalWrapper open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-none w-full h-full max-h-none m-0 rounded-none p-0 flex flex-col">
        <ModalHeader className="p-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <ModalTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Simulador de Pedido
            </ModalTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openDinersModal}
              >
                Gestionar Comensales
              </Button>
              {orderItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSimulator}
                  className="text-destructive hover:text-destructive"
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {orderItems.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No hay platos en el simulador</h3>
              <p className="text-muted-foreground">
                Añade platos desde la carta para simular tu pedido
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {diners.map((diner) => {
                const dinerItems = getDinerItems(diner.id);
                const dinerTotal = getTotalByDiner(diner.id);

                return (
                  <div key={diner.id} className="bg-accent/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{diner.name}</h3>
                      <div className="font-bold text-primary">
                        {formatPrice(dinerTotal)}
                      </div>
                    </div>

                    {dinerItems.length === 0 ? (
                      <p className="text-muted-foreground text-sm italic">
                        No ha añadido platos aún
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {dinerItems.map((item) => {
                          const price = item.selectedVariant?.price || item.dish.base_price;
                          const itemTotal = price * item.quantity;

                          return (
                            <div key={item.id} className="flex items-center gap-4 bg-background rounded-lg p-3">
                              {/* Dish Image */}
                              {item.dish.image_url ? (
                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.dish.image_url}
                                    alt={item.dish.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-muted/50 rounded-md flex-shrink-0" />
                              )}

                              {/* Dish Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">{item.dish.name}</h4>
                                {item.selectedVariant && (
                                  <p className="text-xs text-muted-foreground">
                                    {item.selectedVariant.name}
                                  </p>
                                )}
                                <p className="text-sm font-medium text-primary">
                                  {formatPrice(price)} × {item.quantity} = {formatPrice(itemTotal)}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDishFromOrder(item.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive ml-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Grand Total */}
              <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Total General</h3>
                  <div className="font-bold text-xl text-primary">
                    {formatPrice(getGrandTotal())}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </ModalWrapper>
  );
}
