
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Dish } from '@/hooks/useRestaurantMenu';

export interface Diner {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  dish: Dish;
  dinerId: string;
  quantity: number;
  selectedVariant?: {
    id: number;
    name: string;
    price: number;
  };
}

interface OrderSimulatorContextType {
  diners: Diner[];
  orderItems: OrderItem[];
  isSimulatorOpen: boolean;
  isDinersModalOpen: boolean;
  isSaveTicketModalOpen: boolean;
  addDiner: (name: string) => void;
  removeDiner: (dinerId: string) => void;
  addDishToOrder: (dish: Dish, dinerId: string, quantity?: number) => void;
  removeDishFromOrder: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  openSimulator: () => void;
  closeSimulator: () => void;
  openDinersModal: () => void;
  closeDinersModal: () => void;
  openSaveTicketModal: () => void;
  closeSaveTicketModal: () => void;
  getTotalByDiner: (dinerId: string) => number;
  getGrandTotal: () => number;
  clearSimulator: () => void;
  loadTicket: (items: any[], diners: any[]) => void;
}

const OrderSimulatorContext = createContext<OrderSimulatorContextType | undefined>(undefined);

export const useOrderSimulator = () => {
  const context = useContext(OrderSimulatorContext);
  if (!context) {
    throw new Error('useOrderSimulator must be used within OrderSimulatorProvider');
  }
  return context;
};

export const OrderSimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [diners, setDiners] = useState<Diner[]>([
    { id: '1', name: 'Comensal 1' }
  ]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDinersModalOpen, setIsDinersModalOpen] = useState(false);
  const [isSaveTicketModalOpen, setIsSaveTicketModalOpen] = useState(false);

  const addDiner = useCallback((name: string) => {
    const newDiner: Diner = {
      id: Date.now().toString(),
      name: name.trim()
    };
    setDiners(prev => [...prev, newDiner]);
  }, []);

  const removeDiner = useCallback((dinerId: string) => {
    // Don't allow removing if it's the last diner
    if (diners.length <= 1) return;
    
    setDiners(prev => prev.filter(d => d.id !== dinerId));
    // Remove all items for this diner
    setOrderItems(prev => prev.filter(item => item.dinerId !== dinerId));
  }, [diners.length]);

  const addDishToOrder = useCallback((dish: Dish, dinerId: string, quantity = 1) => {
    const defaultVariant = dish.variants?.find(v => v.is_default);
    
    const newItem: OrderItem = {
      id: Date.now().toString(),
      dish,
      dinerId,
      quantity,
      selectedVariant: defaultVariant
    };
    
    setOrderItems(prev => [...prev, newItem]);
  }, []);

  const removeDishFromOrder = useCallback((itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeDishFromOrder(itemId);
      return;
    }
    
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, [removeDishFromOrder]);

  const getTotalByDiner = useCallback((dinerId: string) => {
    return orderItems
      .filter(item => item.dinerId === dinerId)
      .reduce((total, item) => {
        const price = item.selectedVariant?.price || item.dish.base_price;
        return total + (price * item.quantity);
      }, 0);
  }, [orderItems]);

  const getGrandTotal = useCallback(() => {
    return orderItems.reduce((total, item) => {
      const price = item.selectedVariant?.price || item.dish.base_price;
      return total + (price * item.quantity);
    }, 0);
  }, [orderItems]);

  const clearSimulator = useCallback(() => {
    setOrderItems([]);
  }, []);

  const loadTicket = useCallback((items: any[], dinersData: any[]) => {
    // Clear current state
    setOrderItems([]);
    
    // Set diners from ticket
    const loadedDiners = dinersData.map((diner, index) => ({
      id: (index + 1).toString(),
      name: diner.name
    }));
    setDiners(loadedDiners);

    // Set order items from ticket
    const loadedItems = items.map((item, index) => {
      const diner = loadedDiners.find(d => d.name === item.diner_name) || loadedDiners[0];
      
      // Create a simplified dish object with the necessary data
      const dish: Dish = {
        id: item.dish_id,
        name: item.dish_name,
        description: '',
        base_price: item.unit_price,
        image_url: item.dish_image_url,
        image_alt: item.dish_name,
        is_featured: false,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: false,
        is_lactose_free: false,
        is_healthy: false,
        spice_level: 0,
        preparation_time_minutes: null,
        favorites_count: 0,
        allergens: [],
        custom_tags: [],
        variants: item.variant_id ? [{
          id: item.variant_id,
          name: item.variant_name || 'Estándar',
          price: item.unit_price,
          is_default: true
        }] : []
      };

      const orderItem: OrderItem = {
        id: `loaded-${index}`,
        dish,
        dinerId: diner.id,
        quantity: item.quantity,
        selectedVariant: item.variant_id ? {
          id: item.variant_id,
          name: item.variant_name || 'Estándar',
          price: item.unit_price
        } : undefined
      };

      return orderItem;
    });

    setOrderItems(loadedItems);
  }, []);

  const openSimulator = () => setIsSimulatorOpen(true);
  const closeSimulator = () => setIsSimulatorOpen(false);
  const openDinersModal = () => setIsDinersModalOpen(true);
  const closeDinersModal = () => setIsDinersModalOpen(false);
  const openSaveTicketModal = () => setIsSaveTicketModalOpen(true);
  const closeSaveTicketModal = () => setIsSaveTicketModalOpen(false);

  return (
    <OrderSimulatorContext.Provider value={{
      diners,
      orderItems,
      isSimulatorOpen,
      isDinersModalOpen,
      isSaveTicketModalOpen,
      addDiner,
      removeDiner,
      addDishToOrder,
      removeDishFromOrder,
      updateItemQuantity,
      openSimulator,
      closeSimulator,
      openDinersModal,
      closeDinersModal,
      openSaveTicketModal,
      closeSaveTicketModal,
      getTotalByDiner,
      getGrandTotal,
      clearSimulator,
      loadTicket
    }}>
      {children}
    </OrderSimulatorContext.Provider>
  );
};
