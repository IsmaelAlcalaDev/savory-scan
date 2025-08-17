
import { useEffect, useRef } from 'react';
import { realtimeManager } from '@/services/realtimeManager';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDishFavorites } from '@/contexts/DishFavoritesContext';

export const useConsolidatedFavoritesRealtime = () => {
  const { user } = useAuth();
  const { refreshFavorites } = useFavorites();
  const { refreshDishFavorites } = useDishFavorites();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (!user || isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useConsolidatedFavoritesRealtime: Setting up consolidated favorites realtime');

    // Setup single channel for all favorites-related updates
    realtimeManager.setupChannel({
      name: 'favorites-screen',
      subscriptions: [
        {
          table: 'user_saved_restaurants',
          event: 'UPDATE',
          filter: `user_id=eq.${user.id}`,
          handler: (payload) => {
            console.log('Restaurant favorite updated in favorites:', payload);
            
            if (payload.new && typeof payload.new === 'object' && 'restaurant_id' in payload.new) {
              const restaurantId = payload.new.restaurant_id;
              const isActive = payload.new.is_active;
              
              // Broadcast to favorites section
              window.dispatchEvent(new CustomEvent('favoriteToggled', {
                detail: {
                  restaurantId,
                  isFavorite: isActive,
                  newCount: payload.new.favorites_count || 0
                }
              }));
            }
          }
        },
        {
          table: 'user_saved_restaurants',
          event: 'INSERT',
          filter: `user_id=eq.${user.id}`,
          handler: (payload) => {
            console.log('Restaurant favorited in favorites:', payload);
            refreshFavorites();
          }
        },
        {
          table: 'user_saved_dishes',
          event: 'UPDATE',
          filter: `user_id=eq.${user.id}`,
          handler: (payload) => {
            console.log('Dish favorite updated in favorites:', payload);
            
            if (payload.new && typeof payload.new === 'object' && 'dish_id' in payload.new) {
              const dishId = payload.new.dish_id;
              const isActive = payload.new.is_active;
              
              // Broadcast to favorites section
              window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
                detail: {
                  dishId,
                  isFavorite: isActive
                }
              }));
            }
          }
        },
        {
          table: 'user_saved_dishes',
          event: 'INSERT',
          filter: `user_id=eq.${user.id}`,
          handler: (payload) => {
            console.log('Dish favorited in favorites:', payload);
            refreshDishFavorites();
          }
        },
        {
          table: 'restaurants',
          event: 'UPDATE',
          handler: (payload) => {
            console.log('Restaurant updated in favorites context:', payload);
            
            // Update favorites count for restaurant items
            const restaurantId = payload.new?.id;
            const newFavoritesCount = payload.new?.favorites_count;
            
            if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
              window.dispatchEvent(new CustomEvent('restaurantFavoritesCountUpdated', {
                detail: {
                  restaurantId,
                  newCount: newFavoritesCount
                }
              }));
            }
          }
        }
      ]
    });

    return () => {
      console.log('useConsolidatedFavoritesRealtime: Cleaning up');
      realtimeManager.removeChannel('favorites-screen');
      isSetupRef.current = false;
    };
  }, [user]);

  return {
    isActive: !!user && isSetupRef.current
  };
};
