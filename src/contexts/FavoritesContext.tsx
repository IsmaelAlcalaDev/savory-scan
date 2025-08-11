
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
  console.log('FavoritesProvider: Initializing');
  
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});
  const channelRef = useRef<any>(null);

  // Load user favorites into Set for O(1) lookup
  const loadUserFavorites = async () => {
    if (!user) {
      console.log('FavoritesProvider: No user, clearing favorites');
      setFavoritesSet(new Set());
      return;
    }

    try {
      console.log('FavoritesProvider: Loading favorites for user', user.id);
      
      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('FavoritesProvider: Error loading favorites:', error);
        throw error;
      }

      const newFavoritesSet = new Set<number>();
      data?.forEach(item => {
        newFavoritesSet.add(item.restaurant_id);
      });

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

  // Setup real-time subscription for multi-tab sync
  useEffect(() => {
    if (!user) {
      setFavoritesSet(new Set());
      return;
    }

    console.log('FavoritesProvider: Setting up realtime for user', user.id);
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
          console.log('FavoritesProvider: Realtime change detected:', payload);
          
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

            // Emit custom event for other components to listen - NO counter updates here
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

    // Validate session
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session || sessionData.session.user.id !== user.id) {
        console.error('FavoritesProvider: Invalid session detected');
        try {
          await logSecurityEvent('invalid_session_favorite', 'restaurant', String(restaurantId), {
            hasSession: !!sessionData?.session,
            sessionUserId: sessionData?.session?.user?.id,
            contextUserId: user.id
          });
        } catch (error) {
          console.error('FavoritesProvider: Error logging security event:', error);
        }
        
        toast({
          title: "Sesión no válida",
          description: "Vuelve a iniciar sesión para guardar favoritos.",
          variant: "destructive"
        });
        
        if (openLoginModal) openLoginModal();
        return false;
      }
    } catch (error) {
      console.error('FavoritesProvider: Error validating session:', error);
      return false;
    }

    const currentState = favoritesSet.has(restaurantId);
    setLoadingMap(prev => ({ ...prev, [restaurantId]: true }));

    try {
      console.log('FavoritesProvider: Calling toggle_restaurant_favorite_v2 RPC');
      
      // Call the v2 RPC function (DB triggers update counters automatically)
      const { data, error } = await supabase.rpc('toggle_restaurant_favorite_v2' as any, {
        restaurant_id_param: restaurantId,
        saved_from_param: savedFrom
      });

      if (error) {
        console.error('FavoritesProvider: RPC error:', error);
        throw error;
      }

      const result = data as { success: boolean; is_favorite: boolean; action: string };
      console.log('FavoritesProvider: RPC result:', result);
      
      // Update local favorites set immediately; realtime will also confirm
      setFavoriteState(restaurantId, result.is_favorite);

      // Log security event
      try {
        await logSecurityEvent('favorite_toggled', 'restaurant', String(restaurantId), {
          newState: result.is_favorite,
          previousState: currentState,
          action: result.action,
          savedFrom
        });
      } catch (error) {
        console.error('FavoritesProvider: Error logging security event:', error);
      }

      // Show success toast
      toast({
        title: result.is_favorite ? "Restaurante guardado" : "Eliminado de favoritos",
        description: result.is_favorite 
          ? "El restaurante se ha añadido a tus favoritos" 
          : "El restaurante se ha eliminado de tus favoritos"
      });

      return result.is_favorite;

    } catch (error: any) {
      console.error('FavoritesProvider: Error toggling favorite:', error);
      
      try {
        await logSecurityEvent('favorite_toggle_error', 'restaurant', String(restaurantId), {
          error: error?.message,
          code: error?.code,
          userId: user.id,
          currentState,
          savedFrom
        });
      } catch (logError) {
        console.error('FavoritesProvider: Error logging security event:', logError);
      }
      
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
