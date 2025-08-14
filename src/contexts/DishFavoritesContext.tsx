
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { dishFavoritesService } from '@/services/dishFavoritesService';

interface DishFavoritesContextType {
  favorites: Set<number>;
  toggleFavorite: (dishId: number, savedFrom?: string, onLoginRequired?: () => void) => Promise<void>;
  isFavorite: (dishId: number) => boolean;
  isToggling: (dishId: number) => boolean;
  loading: boolean;
}

const DishFavoritesContext = createContext<DishFavoritesContextType | undefined>(undefined);

export const useDishFavorites = () => {
  const context = useContext(DishFavoritesContext);
  if (context === undefined) {
    throw new Error('useDishFavorites must be used within a DishFavoritesProvider');
  }
  return context;
};

interface DishFavoritesProviderProps {
  children: React.ReactNode;
}

export const DishFavoritesProvider: React.FC<DishFavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [toggleStates, setToggleStates] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites(new Set());
        setLoading(false);
        return;
      }

      const favoriteDishIds = await dishFavoritesService.loadUserDishFavorites();
      setFavorites(new Set(favoriteDishIds));
      console.log('DishFavoritesContext: Loaded favorites:', favoriteDishIds);
    } catch (error) {
      console.error('DishFavoritesContext: Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadFavorites();
      } else if (event === 'SIGNED_OUT') {
        setFavorites(new Set());
      }
    });

    // Listen for storage events (multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dishFavoriteToggled') {
        const data = JSON.parse(e.newValue || '{}');
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (data.isNowFavorite) {
            newSet.add(data.dishId);
          } else {
            newSet.delete(data.dishId);
          }
          return newSet;
        });

        // Dispatch custom event for count updates
        window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
          detail: { dishId: data.dishId, newCount: data.newCount }
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (dishId: number, savedFrom: string = 'unknown', onLoginRequired?: () => void) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('DishFavoritesContext: User not authenticated');
        if (onLoginRequired) {
          onLoginRequired();
        }
        return;
      }

      if (toggleStates.has(dishId)) {
        console.log('DishFavoritesContext: Already toggling dish:', dishId);
        return;
      }

      setToggleStates(prev => new Set(prev).add(dishId));

      const result = await dishFavoritesService.toggleDishFavorite(dishId, savedFrom);

      if (result.success) {
        // Update local state
        setFavorites(prev => {
          const newSet = new Set(prev);
          if (result.isNowFavorite) {
            newSet.add(dishId);
          } else {
            newSet.delete(dishId);
          }
          return newSet;
        });

        // Store for multi-tab sync
        localStorage.setItem('dishFavoriteToggled', JSON.stringify({
          dishId,
          isNowFavorite: result.isNowFavorite,
          newCount: result.newCount,
          timestamp: Date.now()
        }));

        // Dispatch event for immediate updates in current tab
        window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
          detail: { dishId, newCount: result.newCount }
        }));

        console.log('DishFavoritesContext: Successfully toggled favorite:', { dishId, isNowFavorite: result.isNowFavorite });
      }
    } catch (error) {
      console.error('DishFavoritesContext: Error toggling favorite:', error);
    } finally {
      setToggleStates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dishId);
        return newSet;
      });
    }
  }, [toggleStates]);

  const isFavorite = useCallback((dishId: number) => {
    return favorites.has(dishId);
  }, [favorites]);

  const isToggling = useCallback((dishId: number) => {
    return toggleStates.has(dishId);
  }, [toggleStates]);

  const value: DishFavoritesContextType = {
    favorites,
    toggleFavorite,
    isFavorite,
    isToggling,
    loading
  };

  return (
    <DishFavoritesContext.Provider value={value}>
      {children}
    </DishFavoritesContext.Provider>
  );
};
