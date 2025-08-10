
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface DishesFavoritesContextType {
  isFavorite: (dishId: number) => boolean;
  isToggling: (dishId: number) => boolean;
  toggleFavorite: (dishId: number, openLoginModal?: () => void) => Promise<boolean>;
  setFavoriteState: (dishId: number, isFavorite: boolean) => void;
  refreshFavorites: () => Promise<void>;
}

const DishesFavoritesContext = createContext<DishesFavoritesContextType | undefined>(undefined);

export const useDishFavoritesContext = () => {
  const context = useContext(DishesFavoritesContext);
  if (!context) {
    throw new Error('useDishFavoritesContext must be used within a DishesFavoritesProvider');
  }
  return context;
};

export const DishesFavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const channelRef = useRef<any>(null);

  const loadUserFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_saved_dishes')
        .select('dish_id, is_active')
        .eq('user_id', user.id);

      if (error) throw error;

      const map: Record<number, boolean> = {};
      data?.forEach((row: any) => {
        map[row.dish_id] = !!row.is_active;
      });
      setFavoritesMap(map);
    } catch (e) {
      console.error('Error loading dish favorites:', e);
    }
  };

  useEffect(() => {
    if (!user) {
      setFavoritesMap({});
      return;
    }

    loadUserFavorites();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`user-dish-favorites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_dishes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Dish favorite change detected:', payload);
          if (payload.new && typeof payload.new === 'object' && 'dish_id' in payload.new) {
            const dishId = (payload.new as any).dish_id;
            const isActive = (payload.new as any).is_active;
            setFavoritesMap(prev => ({ ...prev, [dishId]: isActive }));
          } else if (payload.old && typeof payload.old === 'object' && 'dish_id' in payload.old) {
            const dishId = (payload.old as any).dish_id;
            setFavoritesMap(prev => ({ ...prev, [dishId]: false }));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const refreshFavorites = async () => {
    await loadUserFavorites();
  };

  const setFavoriteState = (dishId: number, isFavorite: boolean) => {
    setFavoritesMap(prev => ({ ...prev, [dishId]: isFavorite }));
  };

  const toggleFavorite = async (dishId: number, openLoginModal?: () => void): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      if (openLoginModal) openLoginModal();
      return false;
    }

    if (loadingMap[dishId]) return favoritesMap[dishId] || false;

    setLoadingMap(prev => ({ ...prev, [dishId]: true }));

    const currentState = favoritesMap[dishId] || false;
    const newState = !currentState;
    setFavoritesMap(prev => ({ ...prev, [dishId]: newState }));

    try {
      const { data, error } = await supabase.rpc('toggle_dish_favorite', {
        user_id_param: user.id,
        dish_id_param: dishId
      });

      if (error) throw error;

      setFavoritesMap(prev => ({ ...prev, [dishId]: !!data }));

      toast({
        title: data ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: data ? "El plato se ha guardado en tus favoritos" : "El plato se ha eliminado de tus favoritos"
      });

      return !!data;
    } catch (e) {
      console.error('Error toggling dish favorite:', e);
      setFavoritesMap(prev => ({ ...prev, [dishId]: currentState }));
      toast({
        title: "Error",
        description: "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        variant: "destructive"
      });
      return currentState;
    } finally {
      setLoadingMap(prev => ({ ...prev, [dishId]: false }));
    }
  };

  const value: DishesFavoritesContextType = {
    isFavorite: (dishId) => favoritesMap[dishId] || false,
    isToggling: (dishId) => loadingMap[dishId] || false,
    toggleFavorite,
    setFavoriteState,
    refreshFavorites
  };

  return <DishesFavoritesContext.Provider value={value}>{children}</DishesFavoritesContext.Provider>;
};

