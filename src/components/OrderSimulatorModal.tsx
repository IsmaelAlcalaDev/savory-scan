
import React, { useState, useMemo } from 'react';
import { X, Plus, Minus, Trash2, Users, Save, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useSavedTickets } from '@/hooks/useSavedTickets';
import { toast } from 'sonner';
import {
  ModalWrapper,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal-wrapper';
import AddDinersModal from './AddDinersModal';
import SaveTicketModal from './SaveTicketModal';

export default function OrderSimulatorModal() {
  const { 
    isOpen, 
    closeSimulator, 
    orderItems, 
    diners, 
    updateItemQuantity, 
    removeItem, 
    assignItemToDiner,
    getSubtotal,
    getTaxes,
    getGrandTotal,
    getItemsForDiner,
    clearOrder
  } = useOrderSimulator();
  
  const { user } = useAuth();
  const { openModal: openAuthModal } = useAuthModal();
  const { saveTicket } = useSavedTickets();

  const [showAddDinersModal, setShowAddDinersModal] = useState(false);
  const [showSaveTicketModal, setShowSaveTicketModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const totalItems = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [orderItems]);

  const subtotal = getSubtotal();
  const taxes = getTaxes();
  const total = getGrandTotal();

  const handleSaveTicket = () => {
    if (!user) {
      // If user is not authenticated, open auth modal
      openAuthModal();
      return;
    }

    // If user is authenticated, show save ticket modal
    setShowSaveTicketModal(true);
  };

  const handleConfirmSave = async (name: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar tickets');
      return { success: false, error: 'Usuario no autenticado' };
    }

    setIsSaving(true);
    try {
      const result = await saveTicket(name);
      if (result.success) {
        toast.success('Ticket guardado exitosamente');
        return { success: true };
      } else {
        toast.error(result.error || 'Error al guardar el ticket');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error('Error inesperado al guardar el ticket');
      return { success: false, error: 'Error inesperado' };
    } finally {
      setIsSaving(false);
    }
  };

  if (orderItems.length === 0) {
    return null;
  }

  return (
    <>
      <ModalWrapper open={isOpen} onOpenChange={closeSimulator}>
        <ModalContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <ModalHeader className="flex items-center justify-between">
            <ModalTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Simulador de Pedido
            </ModalTitle>
          </ModalHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Diners Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comensales ({diners.length})
                </h3>
                <Button
                  onClick={() => setShowAddDinersModal(true)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Gestionar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {diners.map((diner) => {
                  const dinerItems = getItemsForDiner(diner.id);
                  const dinerTotal = dinerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  
                  return (
                    <div key={diner.id} className="bg-muted rounded-lg p-3 min-w-[120px]">
                      <div className="font-medium text-sm">{diner.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {dinerItems.length} platos - {formatPrice(dinerTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platos del Pedido</h3>
              {orderItems.map((item) => (
                <div key={`${item.dishId}-${item.variant || 'default'}`} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                      )}
                      <p className="text-sm font-medium text-primary">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(item.dishId, item.variant, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateItemQuantity(item.dishId, item.variant, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.dishId, item.variant)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Diner Assignment */}
                  {diners.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Asignar a comensal:</p>
                      <div className="flex flex-wrap gap-2">
                        {diners.map((diner) => (
                          <Button
                            key={diner.id}
                            variant={item.assignedTo === diner.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => assignItemToDiner(item.dishId, item.variant, diner.id)}
                          >
                            {diner.name}
                          </Button>
                        ))}
                        <Button
                          variant={!item.assignedTo ? "default" : "outline"}
                          size="sm"
                          onClick={() => assignItemToDiner(item.dishId, item.variant, null)}
                        >
                          Sin asignar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Resumen del Pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos:</span>
                  <span>{formatPrice(taxes)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalItems} platos • {diners.length} comensales
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleSaveTicket}
                variant="outline"
                className="flex-1"
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Ticket'}
              </Button>
              <Button
                onClick={clearOrder}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Pedido
              </Button>
            </div>
          </div>
        </ModalContent>
      </ModalWrapper>

      <AddDinersModal
        isOpen={showAddDinersModal}
        onClose={() => setShowAddDinersModal(false)}
      />

      <SaveTicketModal
        isOpen={showSaveTicketModal}
        onClose={() => setShowSaveTicketModal(false)}
        onSave={handleConfirmSave}
        isLoading={isSaving}
      />
    </>
  );
}
