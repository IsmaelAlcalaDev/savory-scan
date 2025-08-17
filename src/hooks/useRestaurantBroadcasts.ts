
import { useEffect, useRef } from 'react';
import { broadcastManager } from '@/services/broadcastManager';
import { useFavorites } from '@/contexts/FavoritesContext';

export const useRestaurantBroadcasts = () => {
  const { refreshFavorites } = useFavorites();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useRestaurantBroadcasts: Setting up restaurant broadcast events');

    // Setup broadcast channel for restaurant-related events
    broadcastManager.setupBroadcastChannel({
      name: 'restaurant-events',
      events: [
        'menu_updated',
        'promotion_published',
        'event_published',
        'hours_updated'
      ],
      handler: (event) => {
        console.log('Restaurant broadcast received:', event);
        
        switch (event.type) {
          case 'menu_updated':
            // Broadcast menu update to all users viewing this restaurant
            window.dispatchEvent(new CustomEvent('restaurantMenuUpdated', {
              detail: {
                restaurantId: event.payload.restaurantId,
                menuData: event.payload.menuData
              }
            }));
            break;
            
          case 'promotion_published':
            // Broadcast new promotion
            window.dispatchEvent(new CustomEvent('promotionPublished', {
              detail: {
                restaurantId: event.payload.restaurantId,
                promotion: event.payload.promotion
              }
            }));
            break;
            
          case 'event_published':
            // Broadcast new event
            window.dispatchEvent(new CustomEvent('eventPublished', {
              detail: {
                restaurantId: event.payload.restaurantId,
                event: event.payload.event
              }
            }));
            break;
            
          case 'hours_updated':
            // Broadcast hours update
            window.dispatchEvent(new CustomEvent('restaurantHoursUpdated', {
              detail: {
                restaurantId: event.payload.restaurantId,
                schedule: event.payload.schedule
              }
            }));
            break;
        }
      }
    });

    return () => {
      console.log('useRestaurantBroadcasts: Cleaning up');
      broadcastManager.removeBroadcastChannel('restaurant-events');
      isSetupRef.current = false;
    };
  }, []);

  // Helper functions to send broadcasts
  const broadcastMenuUpdate = (restaurantId: number, menuData: any) => {
    broadcastManager.sendBroadcast('restaurant-events', 'menu_updated', {
      restaurantId,
      menuData
    });
  };

  const broadcastPromotionPublished = (restaurantId: number, promotion: any) => {
    broadcastManager.sendBroadcast('restaurant-events', 'promotion_published', {
      restaurantId,
      promotion
    });
  };

  const broadcastEventPublished = (restaurantId: number, event: any) => {
    broadcastManager.sendBroadcast('restaurant-events', 'event_published', {
      restaurantId,
      event
    });
  };

  const broadcastHoursUpdated = (restaurantId: number, schedule: any) => {
    broadcastManager.sendBroadcast('restaurant-events', 'hours_updated', {
      restaurantId,
      schedule
    });
  };

  return {
    broadcastMenuUpdate,
    broadcastPromotionPublished,
    broadcastEventPublished,
    broadcastHoursUpdated
  };
};
