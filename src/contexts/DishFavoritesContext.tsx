import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';
import { DishFavoritesService } from '@/services/dishFavoritesService';

interface DishFavoritesContextType {
  isDishFavorite: (dishId: number) => boolean;
  isToggling: (dishId: number) => boolean;
  toggleDishFavorite: (dishId: number, restaurantId: number, savedFrom?: string, openLoginModal?: () => void) => Promise<boolean>;
  setDishFavoriteState: (dishId: number, isFavorite: boolean) => void;
  refreshDishFavorites: () => Promise<void>;
  dishFavoritesCount: number;
}

const DishFavoritesContext = createContext<DishFavoritesContextType | undefined>(undefined);

export const useDishFavorites = () => {
  const context = useContext(DishFavoritesContext);
  if (context === undefined) {
    throw new Error('useDishFavorites must be used within a DishFavoritesProvider');
  }
  return context;
};

export const DishFavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('DishFavoritesProvider: Initializing');
  
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [dishFavoritesSet, setDishFavoritesSet] = useState<Set<number>>(new Set());
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  // Load user dish favorites using the service
  const loadUserDishFavorites = async () => {
    if (!user) {
      console.log('DishFavoritesProvider: No user, clearing dish favorites');
      setDishFavoritesSet(new Set());
      return;
    }

    try {
      console.log('DishFavoritesProvider: Loading dish favorites for user', user.id);
      
      const favoriteDishIds = await DishFavoritesService.loadUserDishFavorites();
      const newDishFavoritesSet = new Set<number>(favoriteDishIds);

      console.log('DishFavoritesProvider: Loaded dish favorites:', newDishFavoritesSet.size);
      setDishFavoritesSet(newDishFavoritesSet);
    } catch (error) {
      console.error('DishFavoritesProvider: Error in loadUserDishFavorites:', error);
      try {
        await logSecurityEvent('dish_favorites_load_error', 'user', user.id, { error: String(error) });
      } catch (logError) {
        console.error('DishFavoritesProvider: Error logging security event:', logError);
      }
    }
  };

  // Load favorites when user changes
  useEffect(() => {
    loadUserDishFavorites();
  }, [user]);

  const refreshDishFavorites = async () => {
    await loadUserDishFavorites();
  };

  const setDishFavoriteState = (dishId: number, isFavorite: boolean) => {
    setDishFavoritesSet(prev => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(dishId);
      } else {
        newSet.delete(dishId);
      }
      return newSet;
    });
  };

  const toggleDishFavorite = async (
    dishId: number,
    restaurantId: number,
    savedFrom: string = 'toggle',
    openLoginModal?: () => void
  ): Promise<boolean> => {
    console.log('DishFavoritesProvider: Toggle dish favorite called for dish', dishId, 'restaurant', restaurantId);
    
    // Check authentication
    if (!user) {
      console.log('DishFavoritesProvider: No user, showing login prompt');
      try {
        await logSecurityEvent('unauthorized_dish_favorite_attempt', 'dish', String(dishId));
      } catch (error) {
        console.error('DishFavoritesProvider: Error logging security event:', error);
      }
      
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar platos favoritos",
        variant: "destructive"
      });
      
      if (openLoginModal) {
        openLoginModal();
      }
      return false;
    }

    // Prevent double clicks
    if (loadingMap[dishId]) {
      console.log('DishFavoritesProvider: Toggle already in progress for dish', dishId);
      return dishFavoritesSet.has(dishId);
    }

    const currentState = dishFavoritesSet.has(dishId);
    setLoadingMap(prev => ({ ...prev, [dishId]: true }));

    try {
      console.log('DishFavoritesProvider: Calling DishFavoritesService.toggleDishFavorite');
      
      const result = await DishFavoritesService.toggleDishFavorite(dishId, restaurantId, savedFrom);

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle dish favorite');
      }

      console.log('DishFavoritesProvider: Service result:', result);

      // Update local state immediately
      setDishFavoriteState(dishId, result.isFavorite);

      // Log security event
      try {
        await logSecurityEvent('dish_favorite_toggled', 'dish', String(dishId), {
          newState: result.isFavorite,
          previousState: currentState,
          savedFrom,
          restaurantId
        });
      } catch (error) {
        console.error('DishFavoritesProvider: Error logging security event:', error);
      }

      return result.isFavorite;

    } catch (error: any) {
      console.error('DishFavoritesProvider: Error toggling dish favorite:', error);
      
      try {
        await logSecurityEvent('dish_favorite_toggle_error', 'dish', String(dishId), {
          error: error?.message,
          userId: user.id,
          currentState,
          savedFrom,
          restaurantId
        });
      } catch (logError) {
        console.error('DishFavoritesProvider: Error logging security event:', logError);
      }
      
      // Return unchanged state on error
      return currentState;
    } finally {
      setLoadingMap(prev => ({ ...prev, [dishId]: false }));
    }
  };

  const isDishFavorite = (dishId: number) => {
    return dishFavoritesSet.has(dishId);
  };

  const isToggling = (dishId: number) => {
    return loadingMap[dishId] || false;
  };

  const value = {
    isDishFavorite,
    isToggling,
    toggleDishFavorite,
    setDishFavoriteState,
    refreshDishFavorites,
    dishFavoritesCount: dishFavoritesSet.size
  };

  return <DishFavoritesContext.Provider value={value}>{children}</DishFavoritesContext.Provider>;
};
