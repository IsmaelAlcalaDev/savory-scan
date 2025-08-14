
import React from 'react';
import { ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderSimulator } from '@/contexts/OrderSimulatorContext';

export default function OrderSimulatorSummary() {
  const { orderItems, diners, getGrandTotal, openSimulator } = useOrderSimulator();

  if (orderItems.length === 0) {
    return null;
  }

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = getGrandTotal();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <Button
          onClick={openSimulator}
          className="w-full flex items-center justify-between h-12 bg-primary hover:bg-primary/90"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">{totalItems} platos</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Users className="h-3 w-3" />
              <span className="text-sm">{diners.length} comensales</span>
            </div>
          </div>
          
          <div className="font-bold text-lg">
            {formatPrice(total)}
          </div>
        </Button>
      </div>
    </div>
  );
}
