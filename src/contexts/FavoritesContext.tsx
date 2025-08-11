
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
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
    // PASO 2: VERIFICACIÓN DE AUTENTICACIÓN (CRÍTICO)
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

    // Evitar dobles clics mientras hay petición en curso
    if (loadingMap[restaurantId]) {
      return favoritesMap[restaurantId] || false;
    }

    // PASO 3: VALIDACIÓN DE SESIÓN Y USUARIO ACTIVO
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
      return false;
    }

    // PASO 4: VERIFICAR USUARIO ACTIVO
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_active, deleted_at')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_active || userData?.deleted_at) {
      await logSecurityEvent('inactive_user_favorite_attempt', 'restaurant', String(restaurantId), {
        userData,
        userError: userError?.message
      });
      
      toast({
        title: "Usuario inactivo",
        description: "Tu cuenta no está activa. Contacta con soporte.",
        variant: "destructive"
      });
      return false;
    }

    // Estado actual antes de cambiar nada (para posibles reversiones)
    const currentState = favoritesMap[restaurantId] || false;
    
    setLoadingMap(prev => ({ ...prev, [restaurantId]: true }));

    try {
      // PASO 5: LÓGICA DE TOGGLE usando la función RPC existente
      const { data, error } = await supabase.rpc('toggle_restaurant_favorite', {
        user_id_param: user.id,
        restaurant_id_param: restaurantId
      });

      if (error) throw error;

      // Actualizar estado local con resultado de la base de datos
      setFavoritesMap(prev => ({
        ...prev,
        [restaurantId]: data
      }));

      // PASO 7: REGISTRO DE ACTIVIDAD
      await logSecurityEvent('favorite_toggled', 'restaurant', String(restaurantId), {
        newState: data,
        previousState: currentState,
        method: 'rpc_toggle'
      });

      // PASO 8: RESPUESTA AL FRONTEND
      toast({
        title: data ? "Restaurante guardado" : "Eliminado de favoritos",
        description: data 
          ? "El restaurante se ha añadido a tus favoritos" 
          : "El restaurante se ha eliminado de tus favoritos"
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
        userId: user.id,
        currentState
      });
      
      // Revertir estado en caso de error
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
