
import { useEffect, useRef, useState } from 'react';
import { enhancedRealtimeManager } from '@/services/enhancedRealtimeManager';
import { useFavorites } from '@/contexts/FavoritesContext';

interface HomeRealtimeState {
  visibleRestaurantIds: number[];
  isActive: boolean;
  metrics: {
    channelCount: number;
    reconnectionCount: number;
    filterUpdateCount: number;
  };
}

export const useOptimizedHomeRealtime = () => {
  const { refreshFavorites } = useFavorites();
  const [state, setState] = useState<HomeRealtimeState>({
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

    console.log('useOptimizedHomeRealtime: Setting up optimized realtime');

    // Setup viewport tracking with debounce
    enhancedRealtimeManager.setupViewportTracking(
      'home-restaurants',
      '.restaurants-container',
      '[data-restaurant-id]',
      (element) => {
        const id = element.getAttribute('data-restaurant-id');
        return id ? parseInt(id, 10) : 0;
      },
      (visibleIds) => {
        console.log('Home viewport changed (debounced), visible restaurant IDs:', visibleIds);
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
    }, 10000); // Update metrics every 10 seconds

    return () => {
      console.log('useOptimizedHomeRealtime: Cleaning up');
      enhancedRealtimeManager.removeChannel('home-screen');
      enhancedRealtimeManager.removeViewportTracking('home-restaurants');
      
      if (metricsUpdateInterval.current) {
        clearInterval(metricsUpdateInterval.current);
      }
      
      isSetupRef.current = false;
    };
  }, []);

  const setupRealtimeChannel = (visibleIds: number[]) => {
    if (visibleIds.length === 0) return;

    console.log('Setting up optimized home realtime channel for IDs:', visibleIds);

    enhancedRealtimeManager.setupChannel({
      name: 'home-screen',
      subscriptions: [
        {
          table: 'restaurants',
          event: 'UPDATE',
          filter: `id=in.(${visibleIds.join(',')})`,
          handler: (payload) => {
            console.log('Restaurant updated:', payload);
            
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

  const observeRestaurantElements = (elements: Element[]) => {
    enhancedRealtimeManager.observeElements('home-restaurants', elements);
  };

  return {
    state,
    observeRestaurantElements,
    setupRealtimeChannel
  };
};
