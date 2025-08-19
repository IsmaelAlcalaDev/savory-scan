import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';
import { FavoritesService } from '@/services/favoritesService';

interface FavoritesContextType {
  isFavorite: (restaurantId: number) => boolean;
  isToggling: (restaurantId: number) => boolean;
  toggleFavorite: (restaurantId: number, savedFrom?: string, openLoginModal?: () => void) => Promise<boolean>;
  setFavoriteState: (restaurantId: number, isFavorite: boolean) => void;
  refreshFavorites: () => Promise<void>;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('FavoritesProvider: Initializing');
  
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

  // Load user favorites using the service
  const loadUserFavorites = async () => {
    if (!user) {
      console.log('FavoritesProvider: No user, clearing favorites');
      setFavoritesSet(new Set());
      return;
    }

    try {
      console.log('FavoritesProvider: Loading favorites for user', user.id);
      
      const favoriteIds = await FavoritesService.loadUserFavorites();
      const newFavoritesSet = new Set<number>(favoriteIds);

      console.log('FavoritesProvider: Loaded favorites:', newFavoritesSet.size);
      setFavoritesSet(newFavoritesSet);
    } catch (error) {
      console.error('FavoritesProvider: Error in loadUserFavorites:', error);
      try {
        await logSecurityEvent('favorites_load_error', 'user', user.id, { error: String(error) });
      } catch (logError) {
        console.error('FavoritesProvider: Error logging security event:', logError);
      }
    }
  };

  // Load favorites when user changes
  useEffect(() => {
    loadUserFavorites();
  }, [user]);

  const refreshFavorites = async () => {
    await loadUserFavorites();
  };

  const setFavoriteState = (restaurantId: number, isFavorite: boolean) => {
    setFavoritesSet(prev => {
      const newSet = new Set(prev);
      if (isFavorite) {
        newSet.add(restaurantId);
      } else {
        newSet.delete(restaurantId);
      }
      return newSet;
    });
  };

  const toggleFavorite = async (
    restaurantId: number, 
    savedFrom: string = 'toggle',
    openLoginModal?: () => void
  ): Promise<boolean> => {
    console.log('FavoritesProvider: Toggle favorite called for restaurant', restaurantId);
    
    // Check authentication
    if (!user) {
      console.log('FavoritesProvider: No user, showing login prompt');
      try {
        await logSecurityEvent('unauthorized_favorite_attempt', 'restaurant', String(restaurantId));
      } catch (error) {
        console.error('FavoritesProvider: Error logging security event:', error);
      }
      
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar restaurantes favoritos",
        variant: "destructive"
      });
      
      if (openLoginModal) {
        openLoginModal();
      }
      return false;
    }

    // Prevent double clicks
    if (loadingMap[restaurantId]) {
      console.log('FavoritesProvider: Toggle already in progress for restaurant', restaurantId);
      return favoritesSet.has(restaurantId);
    }

    const currentState = favoritesSet.has(restaurantId);
    setLoadingMap(prev => ({ ...prev, [restaurantId]: true }));

    try {
      console.log('FavoritesProvider: Calling FavoritesService.toggleRestaurantFavorite');
      
      const result = await FavoritesService.toggleRestaurantFavorite(restaurantId, savedFrom);

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle favorite');
      }

      console.log('FavoritesProvider: Service result:', result);

      // Update local state immediately
      setFavoriteState(restaurantId, result.isFavorite);

      // Log security event
      try {
        await logSecurityEvent('favorite_toggled', 'restaurant', String(restaurantId), {
          newState: result.isFavorite,
          previousState: currentState,
          savedFrom
        });
      } catch (error) {
        console.error('FavoritesProvider: Error logging security event:', error);
      }

      return result.isFavorite;

    } catch (error: any) {
      console.error('FavoritesProvider: Error toggling favorite:', error);
      
      try {
        await logSecurityEvent('favorite_toggle_error', 'restaurant', String(restaurantId), {
          error: error?.message,
          userId: user.id,
          currentState,
          savedFrom
        });
      } catch (logError) {
        console.error('FavoritesProvider: Error logging security event:', logError);
      }
      
      // Return unchanged state on error
      return currentState;
    } finally {
      setLoadingMap(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  const isFavorite = (restaurantId: number) => {
    return favoritesSet.has(restaurantId);
  };

  const isToggling = (restaurantId: number) => {
    return loadingMap[restaurantId] || false;
  };

  const value = {
    isFavorite,
    isToggling,
    toggleFavorite,
    setFavoriteState,
    refreshFavorites,
    favoritesCount: favoritesSet.size
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
