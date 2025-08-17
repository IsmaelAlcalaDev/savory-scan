
import { useEffect, useRef, useState } from 'react';
import { realtimeManager } from '@/services/realtimeManager';
import { useFavorites } from '@/contexts/FavoritesContext';

interface RestaurantsRealtimeState {
  visibleRestaurantIds: number[];
  isActive: boolean;
}

export const useConsolidatedRestaurantsRealtime = () => {
  const { refreshFavorites } = useFavorites();
  const [state, setState] = useState<RestaurantsRealtimeState>({
    visibleRestaurantIds: [],
    isActive: false
  });
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useConsolidatedRestaurantsRealtime: Setting up consolidated realtime');

    // Setup viewport tracking for restaurants
    realtimeManager.setupViewportTracking(
      'restaurants-list',
      '.restaurants-grid', // Container selector
      '[data-restaurant-id]', // Item selector
      (element) => {
        const id = element.getAttribute('data-restaurant-id');
        return id ? parseInt(id, 10) : 0;
      },
      (visibleIds) => {
        console.log('Restaurants viewport changed, visible IDs:', visibleIds);
        setState(prev => ({ ...prev, visibleRestaurantIds: visibleIds }));
        
        if (visibleIds.length > 0) {
          setupRealtimeChannel(visibleIds);
        }
      }
    );

    return () => {
      console.log('useConsolidatedRestaurantsRealtime: Cleaning up');
      realtimeManager.removeChannel('restaurants-screen');
      realtimeManager.removeViewportTracking('restaurants-list');
      isSetupRef.current = false;
    };
  }, []);

  const setupRealtimeChannel = (visibleIds: number[]) => {
    if (visibleIds.length === 0) return;

    console.log('Setting up restaurants realtime channel for IDs:', visibleIds);

    realtimeManager.setupChannel({
      name: 'restaurants-screen',
      subscriptions: [
        {
          table: 'restaurants',
          event: 'UPDATE',
          filter: `id=in.(${visibleIds.join(',')})`,
          handler: (payload) => {
            console.log('Restaurant updated in restaurants page:', payload);
            
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
          table: 'user_saved_restaurants',
          event: 'INSERT',
          handler: (payload) => {
            console.log('Restaurant favorited in restaurants page:', payload);
            refreshFavorites();
            
            // Broadcast favorite change
            window.dispatchEvent(new CustomEvent('favoriteToggled', {
              detail: {
                restaurantId: payload.new.restaurant_id,
                isFavorite: payload.new.is_active,
                newCount: payload.new.favorites_count || 0
              }
            }));
          }
        },
        {
          table: 'user_saved_restaurants',
          event: 'UPDATE',
          handler: (payload) => {
            console.log('Restaurant favorite updated in restaurants page:', payload);
            refreshFavorites();
            
            // Broadcast favorite change
            window.dispatchEvent(new CustomEvent('favoriteToggled', {
              detail: {
                restaurantId: payload.new.restaurant_id,
                isFavorite: payload.new.is_active,
                newCount: payload.new.favorites_count || 0
              }
            }));
          }
        }
      ]
    });

    setState(prev => ({ ...prev, isActive: true }));
  };

  const observeRestaurantElements = (elements: Element[]) => {
    realtimeManager.observeElements('restaurants-list', elements);
  };

  return {
    state,
    observeRestaurantElements,
    setupRealtimeChannel
  };
};
