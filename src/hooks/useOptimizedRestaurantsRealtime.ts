
import { useEffect, useRef, useState } from 'react';
import { enhancedRealtimeManager } from '@/services/enhancedRealtimeManager';
import { useFavorites } from '@/contexts/FavoritesContext';

interface RestaurantsRealtimeState {
  visibleRestaurantIds: number[];
  isActive: boolean;
  metrics: {
    channelCount: number;
    reconnectionCount: number;
    filterUpdateCount: number;
  };
}

export const useOptimizedRestaurantsRealtime = () => {
  const { refreshFavorites } = useFavorites();
  const [state, setState] = useState<RestaurantsRealtimeState>({
    visibleRestaurantIds: [],
    isActive: false,
    metrics: {
      channelCount: 0,
      reconnectionCount: 0,
      filterUpdateCount: 0
    }
  });
  const isSetupRef = useRef(false);
  const metricsUpdateInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useOptimizedRestaurantsRealtime: Setting up optimized realtime');

    // Setup viewport tracking with debounce
    enhancedRealtimeManager.setupViewportTracking(
      'restaurants-list',
      '.restaurants-grid',
      '[data-restaurant-id]',
      (element) => {
        const id = element.getAttribute('data-restaurant-id');
        return id ? parseInt(id, 10) : 0;
      },
      (visibleIds) => {
        console.log('Restaurants viewport changed (debounced), visible IDs:', visibleIds);
        setState(prev => ({ ...prev, visibleRestaurantIds: visibleIds }));
        
        if (visibleIds.length > 0) {
          setupRealtimeChannel(visibleIds);
        }
      }
    );

    // Setup metrics monitoring  
    metricsUpdateInterval.current = setInterval(() => {
      const status = enhancedRealtimeManager.getStatus();
      setState(prev => ({
        ...prev,
        metrics: {
          channelCount: status.metrics.channelCount,
          reconnectionCount: status.metrics.reconnectionCount,
          filterUpdateCount: status.metrics.filterUpdateCount
        }
      }));
    }, 10000);

    return () => {
      console.log('useOptimizedRestaurantsRealtime: Cleaning up');
      enhancedRealtimeManager.removeChannel('restaurants-screen');
      enhancedRealtimeManager.removeViewportTracking('restaurants-list');
      
      if (metricsUpdateInterval.current) {
        clearInterval(metricsUpdateInterval.current);
      }
      
      isSetupRef.current = false;
    };
  }, []);

  const setupRealtimeChannel = (visibleIds: number[]) => {
    if (visibleIds.length === 0) return;

    console.log('Setting up optimized restaurants realtime channel for IDs:', visibleIds);

    enhancedRealtimeManager.setupChannel({
      name: 'restaurants-screen',
      subscriptions: [
        {
          table: 'restaurants',
          event: 'UPDATE',
          filter: `id=in.(${visibleIds.join(',')})`,
          handler: (payload) => {
            console.log('Restaurant updated in restaurants page:', payload);
            
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
    enhancedRealtimeManager.observeElements('restaurants-list', elements);
  };

  return {
    state,
    observeRestaurantElements,
    setupRealtimeChannel
  };
};
