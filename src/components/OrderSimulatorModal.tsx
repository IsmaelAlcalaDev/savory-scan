
import React from 'react';
import { X, Users, Minus, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal-wrapper';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSavedTickets } from '@/hooks/useSavedTickets';
import SaveTicketModal from './SaveTicketModal';

interface OrderSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: number;
}

export default function OrderSimulatorModal({ isOpen, onClose, restaurantId }: OrderSimulatorModalProps) {
  const { user } = useAuth();
  const {
    diners,
    orderItems,
    updateItemQuantity,
    removeDishFromOrder,
    getTotalByDiner,
    getGrandTotal,
    clearSimulator,
    openDinersModal,
    isSaveTicketModalOpen,
    openSaveTicketModal,
    closeSaveTicketModal
  } = useOrderSimulator();

  const { saveTicket, loading: savingTicket } = useSavedTickets(restaurantId || 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getDinerItems = (dinerId: string) => {
    return orderItems.filter(item => item.dinerId === dinerId);
  };

  const handleSaveTicket = async (name: string) => {
    if (!restaurantId) {
      return { success: false, error: 'ID de restaurante no disponible' };
    }

    const result = await saveTicket(name, orderItems, diners, getGrandTotal());
    return result;
  };

  const generateDefaultTicketName = () => {
    const now = new Date();
    const date = now.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
    const time = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `Ticket ${date} ${time}`;
  };

  return (
    <>
      <ModalWrapper open={isOpen} onOpenChange={onClose}>
        <ModalContent className="fixed inset-0 max-w-none w-screen h-screen max-h-none m-0 rounded-none p-0 flex flex-col bg-background">
          {/* Custom Header */}
          <div className="flex-shrink-0 bg-background border-b px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-bold">Simulador de Pedido</h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDinersModal}
                  className="hidden sm:flex"
                >
                  Gestionar Comensales
                </Button>
                {orderItems.length > 0 && (
                  <>
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openSaveTicketModal}
                        className="hidden sm:flex"
                        disabled={savingTicket}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSimulator}
                      className="text-destructive hover:text-destructive hidden sm:flex"
                    >
                      Limpiar
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile action buttons */}
            <div className="flex sm:hidden gap-2 mt-3">
              <Button
                variant="outline"  
                size="sm"
                onClick={openDinersModal}
                className="flex-1"
              >
                Gestionar Comensales
              </Button>
              {orderItems.length > 0 && (
                <>
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openSaveTicketModal}
                      disabled={savingTicket}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSimulator}
                    className="text-destructive hover:text-destructive"
                  >
                    Limpiar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {orderItems.length === 0 ? (
              <div className="flex items-center justify-center h-full px-4">
                <div className="text-center max-w-md">
                  <Users className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                  <h3 className="text-2xl font-semibold mb-3">No hay platos en el simulador</h3>
                  <p className="text-muted-foreground text-lg">
                    Añade platos desde la carta para simular tu pedido
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
                {diners.map((diner) => {
                  const dinerItems = getDinerItems(diner.id);
                  const dinerTotal = getTotalByDiner(diner.id);

                  return (
                    <div key={diner.id} className="bg-accent/20 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl sm:text-2xl">{diner.name}</h3>
                        <div className="font-bold text-xl sm:text-2xl text-primary">
                          {formatPrice(dinerTotal)}
                        </div>
                      </div>

                      {dinerItems.length === 0 ? (
                        <p className="text-muted-foreground italic text-center py-8">
                          No ha añadido platos aún
                        </p>
                      ) : (
                        <div className="grid gap-4">
                          {dinerItems.map((item) => {
                            const price = item.selectedVariant?.price || item.dish.base_price;
                            const itemTotal = price * item.quantity;

                            return (
                              <div key={item.id} className="bg-background rounded-xl p-4 shadow-sm">
                                <div className="flex items-start gap-4">
                                  {/* Dish Image */}
                                  <div className="flex-shrink-0">
                                    {item.dish.image_url ? (
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
                                        <img
                                          src={item.dish.image_url}
                                          alt={item.dish.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-lg" />
                                    )}
                                  </div>

                                  {/* Dish Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-lg sm:text-xl mb-1">{item.dish.name}</h4>
                                    {item.selectedVariant && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {item.selectedVariant.name}
                                      </p>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                      <p className="text-base font-medium text-primary">
                                        {formatPrice(price)} × {item.quantity}
                                      </p>
                                      <p className="text-lg font-bold text-primary">
                                        = {formatPrice(itemTotal)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex-shrink-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-10 text-center font-semibold text-lg">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeDishFromOrder(item.id)}
                                      className="h-8 w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fixed Footer with Grand Total */}
          {orderItems.length > 0 && (
            <div className="flex-shrink-0 bg-background border-t px-4 sm:px-6 py-4">
              <div className="max-w-6xl mx-auto">
                <div className="bg-primary/10 rounded-xl p-4 sm:p-6 border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl sm:text-2xl">Total General</h3>
                    <div className="font-bold text-2xl sm:text-3xl text-primary">
                      {formatPrice(getGrandTotal())}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalContent>
      </ModalWrapper>

      <SaveTicketModal
        isOpen={isSaveTicketModalOpen}
        onClose={closeSaveTicketModal}
        onSave={handleSaveTicket}
        defaultName={generateDefaultTicketName()}
        isLoading={savingTicket}
      />
    </>
  );
}
