
import { useEffect, useRef, useState } from 'react';
import { realtimeManager } from '@/services/realtimeManager';
import { useFavorites } from '@/contexts/FavoritesContext';

interface HomeRealtimeState {
  visibleRestaurantIds: number[];
  isActive: boolean;
}

export const useConsolidatedHomeRealtime = () => {
  const { refreshFavorites } = useFavorites();
  const [state, setState] = useState<HomeRealtimeState>({
    visibleRestaurantIds: [],
    isActive: false
  });
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useConsolidatedHomeRealtime: Setting up consolidated realtime');

    // Setup viewport tracking for restaurants
    realtimeManager.setupViewportTracking(
      'home-restaurants',
      '.restaurants-container', // Container selector
      '[data-restaurant-id]', // Item selector  
      (element) => {
        const id = element.getAttribute('data-restaurant-id');
        return id ? parseInt(id, 10) : 0;
      },
      (visibleIds) => {
        console.log('Home viewport changed, visible restaurant IDs:', visibleIds);
        setState(prev => ({ ...prev, visibleRestaurantIds: visibleIds }));
        
        if (visibleIds.length > 0) {
          setupRealtimeChannel(visibleIds);
        }
      }
    );

    return () => {
      console.log('useConsolidatedHomeRealtime: Cleaning up');
      realtimeManager.removeChannel('home-screen');
      realtimeManager.removeViewportTracking('home-restaurants');
      isSetupRef.current = false;
    };
  }, []);

  const setupRealtimeChannel = (visibleIds: number[]) => {
    if (visibleIds.length === 0) return;

    console.log('Setting up home realtime channel for IDs:', visibleIds);

    realtimeManager.setupChannel({
      name: 'home-screen',
      subscriptions: [
        {
          table: 'restaurants',
          event: 'UPDATE',
          filter: `id=in.(${visibleIds.join(',')})`,
          handler: (payload) => {
            console.log('Restaurant updated:', payload);
            
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
          table: 'dishes',
          event: 'UPDATE', 
          filter: `restaurant_id=in.(${visibleIds.join(',')})`,
          handler: (payload) => {
            console.log('Dish updated:', payload);
            
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
          table: 'user_saved_restaurants',
          event: 'INSERT',
          handler: (payload) => {
            console.log('Restaurant favorited:', payload);
            refreshFavorites();
          }
        },
        {
          table: 'user_saved_restaurants', 
          event: 'UPDATE',
          handler: (payload) => {
            console.log('Restaurant favorite updated:', payload);
            refreshFavorites();
          }
        }
      ]
    });

    setState(prev => ({ ...prev, isActive: true }));
  };

  // Function to observe new restaurant elements
  const observeRestaurantElements = (elements: Element[]) => {
    realtimeManager.observeElements('home-restaurants', elements);
  };

  return {
    state,
    observeRestaurantElements,
    setupRealtimeChannel
  };
};
