
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DishFavoritesService } from '@/services/dishFavoritesService';
import { supabase } from '@/integrations/supabase/client';

interface DishFavoritesContextType {
  isDishFavorite: (dishId: number) => boolean;
  isDishToggling: (dishId: number) => boolean;
  toggleDishFavorite: (dishId: number, savedFrom?: string, onLoginRequired?: () => void) => Promise<void>;
  refreshDishFavorites: () => Promise<void>;
  dishFavoritesCount: number;
}

const DishFavoritesContext = createContext<DishFavoritesContextType | undefined>(undefined);

interface DishFavoritesProviderProps {
  children: ReactNode;
}

export function DishFavoritesProvider({ children }: DishFavoritesProviderProps) {
  const { user } = useAuth();
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [togglingSet, setTogglingSet] = useState<Set<number>>(new Set());
  const [dishFavoritesCount, setDishFavoritesCount] = useState(0);

  // Initialize favorites when user changes
  useEffect(() => {
    if (user) {
      loadDishFavorites();
      setupRealtimeSubscription();
    } else {
      setFavoritesSet(new Set());
      setDishFavoritesCount(0);
    }
  }, [user]);

  // Listen to dishFavoriteToggled events for real-time updates
  useEffect(() => {
    const handleDishFavoriteToggled = (event: CustomEvent) => {
      const { dishId, isFavorite, userId } = event.detail;
      
      // Only update if this event is for the current user
      if (user && userId === user.id) {
        setFavoritesSet(prev => {
          const newSet = new Set(prev);
          if (isFavorite) {
            newSet.add(dishId);
          } else {
            newSet.delete(dishId);
          }
          return newSet;
        });
        
        setDishFavoritesCount(prev => isFavorite ? prev + 1 : Math.max(0, prev - 1));
      }
    };

    window.addEventListener('dishFavoriteToggled', handleDishFavoriteToggled as EventListener);
    return () => {
      window.removeEventListener('dishFavoriteToggled', handleDishFavoriteToggled as EventListener);
    };
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel(`dish-favorites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_dishes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Dish favorites change detected:', payload);
          
          if (payload.eventType === 'DELETE' || 
              (payload.eventType === 'UPDATE' && payload.new && 
               typeof payload.new === 'object' && 'is_active' in payload.new && !payload.new.is_active)) {
            const dishId = (payload.old && typeof payload.old === 'object' && 'dish_id' in payload.old) 
              ? (payload.old as any).dish_id 
              : (payload.new && typeof payload.new === 'object' && 'dish_id' in payload.new) 
                ? (payload.new as any).dish_id 
                : null;
            
            if (dishId) {
              setFavoritesSet(prev => {
                const newSet = new Set(prev);
                newSet.delete(dishId);
                return newSet;
              });
              setDishFavoritesCount(prev => Math.max(0, prev - 1));
            }
          } else if (payload.eventType === 'INSERT' && payload.new && 
                     typeof payload.new === 'object' && 'is_active' in payload.new && (payload.new as any).is_active) {
            const dishId = (payload.new as any).dish_id;
            if (dishId) {
              setFavoritesSet(prev => new Set([...prev, dishId]));
              setDishFavoritesCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadDishFavorites = async () => {
    try {
      const dishIds = await DishFavoritesService.loadUserDishFavorites();
      setFavoritesSet(new Set(dishIds));
      setDishFavoritesCount(dishIds.length);
    } catch (error) {
      console.error('Failed to load dish favorites:', error);
    }
  };

  const isDishFavorite = (dishId: number): boolean => {
    return favoritesSet.has(dishId);
  };

  const isDishToggling = (dishId: number): boolean => {
    return togglingSet.has(dishId);
  };

  const toggleDishFavorite = async (
    dishId: number, 
    savedFrom: string = 'button',
    onLoginRequired?: () => void
  ): Promise<void> => {
    if (!user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    if (togglingSet.has(dishId)) {
      return; // Already toggling
    }

    setTogglingSet(prev => new Set([...prev, dishId]));

    try {
      await DishFavoritesService.toggleDishFavorite(dishId, savedFrom);
    } finally {
      setTogglingSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(dishId);
        return newSet;
      });
    }
  };

  const refreshDishFavorites = async (): Promise<void> => {
    if (user) {
      await loadDishFavorites();
    }
  };

  return (
    <DishFavoritesContext.Provider
      value={{
        isDishFavorite,
        isDishToggling,
        toggleDishFavorite,
        refreshDishFavorites,
        dishFavoritesCount
      }}
    >
      {children}
    </DishFavoritesContext.Provider>
  );
}

export function useDishFavorites() {
  const context = useContext(DishFavoritesContext);
  if (context === undefined) {
    throw new Error('useDishFavorites must be used within a DishFavoritesProvider');
  }
  return context;
}
