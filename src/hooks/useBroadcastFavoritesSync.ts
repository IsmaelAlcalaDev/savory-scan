
import { useEffect, useRef } from 'react';
import { broadcastFavoritesManager } from '@/services/broadcastFavoritesManager';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useDishFavorites } from '@/contexts/DishFavoritesContext';

export const useBroadcastFavoritesSync = () => {
  const { user } = useAuth();
  const { setFavoriteState, refreshFavorites } = useFavorites();
  const { setDishFavoriteState, refreshDishFavorites } = useDishFavorites();
  const isSetupRef = useRef(false);

  useEffect(() => {
    if (!user || isSetupRef.current) return;
    isSetupRef.current = true;

    console.log('useBroadcastFavoritesSync: Setting up broadcast favorites sync');

    // Setup broadcast channel for cross-tab favorites synchronization
    broadcastFavoritesManager.setupUserFavoritesChannel(user.id, {
      onRestaurantFavoriteToggled: (restaurantId, isFavorite) => {
        console.log('useBroadcastFavoritesSync: Restaurant favorite toggled:', restaurantId, isFavorite);
        setFavoriteState(restaurantId, isFavorite);
        
        // Also dispatch custom event for components that listen to it
        window.dispatchEvent(new CustomEvent('favoriteToggled', {
          detail: {
            restaurantId,
            isFavorite,
            newCount: 0 // Will be updated by realtime on restaurants table
          }
        }));
      },
      onDishFavoriteToggled: (dishId, isFavorite) => {
        console.log('useBroadcastFavoritesSync: Dish favorite toggled:', dishId, isFavorite);
        setDishFavoriteState(dishId, isFavorite);
        
        // Also dispatch custom event for components that listen to it
        window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
          detail: {
            dishId,
            isFavorite
          }
        }));
      },
      onFavoritesSync: () => {
        console.log('useBroadcastFavoritesSync: Syncing all favorites');
        refreshFavorites();
        refreshDishFavorites();
      }
    });

    return () => {
      console.log('useBroadcastFavoritesSync: Cleaning up');
      broadcastFavoritesManager.removeChannel(`user-favorites-${user.id}`);
      isSetupRef.current = false;
    };
  }, [user]);

  return {
    isActive: !!user && isSetupRef.current
  };
};
