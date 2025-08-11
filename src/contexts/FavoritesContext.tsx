import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';

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
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const channelRef = useRef<any>(null);

  // Load user favorites into Set for O(1) lookup
  const loadUserFavorites = async () => {
    if (!user) {
      setFavoritesSet(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const newFavoritesSet = new Set<number>();
      data?.forEach(item => {
        newFavoritesSet.add(item.restaurant_id);
      });

      setFavoritesSet(newFavoritesSet);
    } catch (error) {
      console.error('Error loading favorites:', error);
      await logSecurityEvent('favorites_load_error', 'user', user.id, { error: String(error) });
    }
  };

  // Setup real-time subscription for multi-tab sync
  useEffect(() => {
    if (!user) {
      setFavoritesSet(new Set());
      return;
    }

    loadUserFavorites();

    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel for this user with realtime updates
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
          console.log('Favorite change detected via realtime:', payload);
          
          if (payload.new && typeof payload.new === 'object' && 'restaurant_id' in payload.new) {
            const restaurantId = payload.new.restaurant_id;
            const isActive = payload.new.is_active;
            
            setFavoritesSet(prev => {
              const newSet = new Set(prev);
              if (isActive) {
                newSet.add(restaurantId);
              } else {
                newSet.delete(restaurantId);
              }
              return newSet;
            });

            // Emit custom event for other components to listen
            window.dispatchEvent(new CustomEvent('favoriteToggled', {
              detail: { restaurantId, isFavorite: isActive }
            }));
            
          } else if (payload.old && typeof payload.old === 'object' && 'restaurant_id' in payload.old) {
            const restaurantId = payload.old.restaurant_id;
            
            setFavoritesSet(prev => {
              const newSet = new Set(prev);
              newSet.delete(restaurantId);
              return newSet;
            });

            window.dispatchEvent(new CustomEvent('favoriteToggled', {
              detail: { restaurantId, isFavorite: false }
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
    // Check authentication
    if (!user) {
      await logSecurityEvent('unauthorized_favorite_attempt', 'restaurant', String(restaurantId));
      
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
      return favoritesSet.has(restaurantId);
    }

    // Validate session
    const { data: sessionData } = await supabase.auth.getSession();
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
      return false;
    }

    // IMPORTANT: remove blocking check against public.users (may not have those columns)
    // We rely on auth + RLS. If you want this check, we can re-add later against a known-safe table.

    const currentState = favoritesSet.has(restaurantId);
    setLoadingMap(prev => ({ ...prev, [restaurantId]: true }));

    try {
      // Call the v2 RPC function (DB triggers update counters + realtime emits)
      const { data, error } = await supabase.rpc('toggle_restaurant_favorite_v2' as any, {
        restaurant_id_param: restaurantId,
        saved_from_param: savedFrom
      });

      if (error) throw error;

      const result = data as { success: boolean; is_favorite: boolean; action: string };
      
      // Update local favorites set immediately; realtime will also confirm
      setFavoriteState(restaurantId, result.is_favorite);

      // Log security event
      await logSecurityEvent('favorite_toggled', 'restaurant', String(restaurantId), {
        newState: result.is_favorite,
        previousState: currentState,
        action: result.action,
        savedFrom
      });

      // Show success toast
      toast({
        title: result.is_favorite ? "Restaurante guardado" : "Eliminado de favoritos",
        description: result.is_favorite 
          ? "El restaurante se ha añadido a tus favoritos" 
          : "El restaurante se ha eliminado de tus favoritos"
      });

      // Do NOT dispatch window event here to avoid duplicates; realtime already does it
      return result.is_favorite;

    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      
      await logSecurityEvent('favorite_toggle_error', 'restaurant', String(restaurantId), {
        error: error?.message,
        code: error?.code,
        userId: user.id,
        currentState,
        savedFrom
      });
      
      toast({
        title: "Error",
        description: error?.message || "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        variant: "destructive"
      });
      
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
