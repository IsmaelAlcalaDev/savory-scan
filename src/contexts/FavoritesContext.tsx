
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';

interface FavoritesContextType {
  isFavorite: (restaurantId: number) => boolean;
  isToggling: (restaurantId: number) => boolean;
  toggleFavorite: (restaurantId: number, openLoginModal?: () => void) => Promise<boolean>;
  setFavoriteState: (restaurantId: number, isFavorite: boolean) => void;
  refreshFavorites: () => Promise<void>;
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
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [favoritesMap, setFavoritesMap] = useState<Record<number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const channelRef = useRef<any>(null);

  // Load user favorites
  const loadUserFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const newFavoritesMap: Record<number, boolean> = {};
      data?.forEach(item => {
        newFavoritesMap[item.restaurant_id] = true;
      });

      setFavoritesMap(newFavoritesMap);
    } catch (error) {
      console.error('Error loading favorites:', error);
      await logSecurityEvent('favorites_load_error', 'user', user.id, { error: String(error) });
    }
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!user) {
      setFavoritesMap({});
      return;
    }

    loadUserFavorites();

    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for this user
    const channel = supabase
      .channel(`user-favorites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_restaurants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Favorite change detected:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'restaurant_id' in payload.new) {
            const restaurantId = payload.new.restaurant_id;
            const isActive = payload.new.is_active;
            
            setFavoritesMap(prev => ({
              ...prev,
              [restaurantId]: isActive
            }));
          } else if (payload.old && typeof payload.old === 'object' && 'restaurant_id' in payload.old) {
            const restaurantId = payload.old.restaurant_id;
            
            setFavoritesMap(prev => ({
              ...prev,
              [restaurantId]: false
            }));
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

  const setFavoriteState = (restaurantId: number, isFavorite: boolean) => {
    setFavoritesMap(prev => ({
      ...prev,
      [restaurantId]: isFavorite
    }));
  };

  const toggleFavorite = async (restaurantId: number, openLoginModal?: () => void): Promise<boolean> => {
    if (!user) {
      await logSecurityEvent('unauthorized_favorite_attempt', 'restaurant', String(restaurantId));
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      
      if (openLoginModal) {
        openLoginModal();
      }
      return false;
    }

    // Evita dobles clics mientras hay petición en curso
    if (loadingMap[restaurantId]) return favoritesMap[restaurantId] || false;

    // Estado actual antes de cambiar nada (para posibles reversiones)
    const currentState = favoritesMap[restaurantId] || false;

    // Verificar sesión de Supabase antes del RPC
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (!sessionData?.session || sessionData.session.user.id !== user.id) {
      await logSecurityEvent('invalid_session_favorite', 'restaurant', String(restaurantId), {
        hasSession: !!sessionData?.session,
        sessionUserId: sessionData?.session?.user?.id,
        contextUserId: user.id
      });
      
      toast({
        title: "Sesión no válida",
        description: "Vuelve a iniciar sesión para guardar favoritos.",
        variant: "destructive"
      });
      if (openLoginModal) openLoginModal();
      return currentState;
    }

    setLoadingMap(prev => ({ ...prev, [restaurantId]: true }));

    // Optimistic update
    const newState = !currentState;    
    setFavoritesMap(prev => ({
      ...prev,
      [restaurantId]: newState
    }));

    try {
      const { data, error } = await supabase.rpc('toggle_restaurant_favorite', {
        user_id_param: user.id,
        restaurant_id_param: restaurantId
      });

      if (error) throw error;

      // Confirmar estado desde DB
      setFavoritesMap(prev => ({
        ...prev,
        [restaurantId]: data
      }));

      // Log successful action
      await logSecurityEvent('favorite_toggled', 'restaurant', String(restaurantId), {
        newState: data,
        previousState: currentState
      });

      toast({
        title: data ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: data ? "El restaurante se ha guardado en tus favoritos" : "El restaurante se ha eliminado de tus favoritos"
      });

      return data;

    } catch (error: any) {
      console.error('Error toggling favorite:', {
        error,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        message: error?.message
      });
      
      // Log security event for error
      await logSecurityEvent('favorite_toggle_error', 'restaurant', String(restaurantId), {
        error: error?.message,
        code: error?.code,
        userId: user.id
      });
      
      // Revertir optimistic update
      setFavoritesMap(prev => ({
        ...prev,
        [restaurantId]: currentState
      }));
      
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        variant: "destructive"
      });
      
      return currentState;
    } finally {
      setLoadingMap(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  const isFavorite = (restaurantId: number) => {
    return favoritesMap[restaurantId] || false;
  };

  const isToggling = (restaurantId: number) => {
    return loadingMap[restaurantId] || false;
  };

  const value = {
    isFavorite,
    isToggling,
    toggleFavorite,
    setFavoriteState,
    refreshFavorites
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
