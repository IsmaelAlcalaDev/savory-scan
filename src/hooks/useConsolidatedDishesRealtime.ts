
import { useEffect, useRef, useState } from 'react';
import { realtimeManager } from '@/services/realtimeManager';
import { useDishFavorites } from '@/contexts/DishFavoritesContext';

interface DishesRealtimeState {
  visibleDishIds: number[];
  visibleRestaurantIds: number[];
  isActive: boolean;
}

export const useConsolidatedDishesRealtime = () => {
  const { refreshDishFavorites } = useDishFavorites();
  const [state, setState] = useState<DishesRealtimeState>({
    visibleDishIds: [],
    visibleRestaurantIds: [],
    isActive: false
  });
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useConsolidatedDishesRealtime: Setting up consolidated realtime');

    // Setup viewport tracking for dishes
    realtimeManager.setupViewportTracking(
      'dishes-list',
      '.dishes-grid', // Container selector
      '[data-dish-id]', // Item selector
      (element) => {
        const id = element.getAttribute('data-dish-id');
        return id ? parseInt(id, 10) : 0;
      },
      (visibleIds) => {
        console.log('Dishes viewport changed, visible dish IDs:', visibleIds);
        
        // Also collect restaurant IDs from visible dishes
        const restaurantIds = Array.from(document.querySelectorAll('[data-dish-id]'))
          .filter(el => visibleIds.includes(parseInt(el.getAttribute('data-dish-id') || '0', 10)))
          .map(el => parseInt(el.getAttribute('data-restaurant-id') || '0', 10))
          .filter((id, index, arr) => arr.indexOf(id) === index && id > 0);

        setState(prev => ({ 
          ...prev, 
          visibleDishIds: visibleIds,
          visibleRestaurantIds: restaurantIds
        }));
        
        if (visibleIds.length > 0) {
          setupRealtimeChannel(visibleIds, restaurantIds);
        }
      }
    );

    return () => {
      console.log('useConsolidatedDishesRealtime: Cleaning up');
      realtimeManager.removeChannel('dishes-screen');
      realtimeManager.removeViewportTracking('dishes-list');
      isSetupRef.current = false;
    };
  }, []);

  const setupRealtimeChannel = (visibleDishIds: number[], visibleRestaurantIds: number[]) => {
    if (visibleDishIds.length === 0) return;

    console.log('Setting up dishes realtime channel for dish IDs:', visibleDishIds);
    console.log('And restaurant IDs:', visibleRestaurantIds);

    realtimeManager.setupChannel({
      name: 'dishes-screen',
      subscriptions: [
        {
          table: 'dishes',
          event: 'UPDATE',
          filter: `id=in.(${visibleDishIds.join(',')})`,
          handler: (payload) => {
            console.log('Dish updated in dishes page:', payload);
            
            // Broadcast dish update
            window.dispatchEvent(new CustomEvent('dishUpdated', {
              detail: {
                dishId: payload.new.id,
                restaurantId: payload.new.restaurant_id,
                newData: payload.new
              }
            }));
          }
        },
        {
          table: 'restaurants',
          event: 'UPDATE',
          filter: visibleRestaurantIds.length > 0 ? `id=in.(${visibleRestaurantIds.join(',')})` : undefined,
          handler: (payload) => {
            console.log('Restaurant updated in dishes page:', payload);
            
            // Broadcast restaurant update
            window.dispatchEvent(new CustomEvent('restaurantUpdated', {
              detail: {
                restaurantId: payload.new.id,
                newData: payload.new
              }
            }));
          }
        },
        {
          table: 'user_saved_dishes',
          event: 'INSERT',
          handler: (payload) => {
            console.log('Dish favorited in dishes page:', payload);
            refreshDishFavorites();
            
            // Broadcast dish favorite change
            window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
              detail: {
                dishId: payload.new.dish_id,
                isFavorite: payload.new.is_active
              }
            }));
          }
        },
        {
          table: 'user_saved_dishes',
          event: 'UPDATE',
          handler: (payload) => {
            console.log('Dish favorite updated in dishes page:', payload);
            refreshDishFavorites();
            
            // Broadcast dish favorite change
            window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
              detail: {
                dishId: payload.new.dish_id,
                isFavorite: payload.new.is_active
              }
            }));
          }
        }
      ]
    });

    setState(prev => ({ ...prev, isActive: true }));
  };

  const observeDishElements = (elements: Element[]) => {
    realtimeManager.observeElements('dishes-list', elements);
  };

  return {
    state,
    observeDishElements,
    setupRealtimeChannel
  };
};
