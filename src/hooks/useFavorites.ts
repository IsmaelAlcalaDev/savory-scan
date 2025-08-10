
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FavoriteData {
  [restaurantId: number]: boolean;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteData>({});
  const [loading, setLoading] = useState<{ [restaurantId: number]: boolean }>({});

  // Cargar favoritos del usuario al inicializar
  useEffect(() => {
    if (user) {
      loadUserFavorites();
    } else {
      setFavorites({});
    }
  }, [user]);

  const loadUserFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const favoritesMap: FavoriteData = {};
      data?.forEach(item => {
        favoritesMap[item.restaurant_id] = true;
      });

      setFavorites(favoritesMap);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (restaurantId: number) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      return;
    }

    // Evitar múltiples clicks
    if (loading[restaurantId]) return;

    setLoading(prev => ({ ...prev, [restaurantId]: true }));

    try {
      const { data, error } = await supabase.rpc('toggle_restaurant_favorite', {
        user_id_param: user.id,
        restaurant_id_param: restaurantId
      });

      if (error) throw error;

      // Actualizar estado local inmediatamente
      setFavorites(prev => ({
        ...prev,
        [restaurantId]: data
      }));

      toast({
        title: data ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: data ? "El restaurante se ha guardado en tus favoritos" : "El restaurante se ha eliminado de tus favoritos"
      });

    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el favorito. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [restaurantId]: false }));
    }
  };

  const isFavorite = (restaurantId: number) => {
    return favorites[restaurantId] || false;
  };

  const isToggling = (restaurantId: number) => {
    return loading[restaurantId] || false;
  };

  return {
    isFavorite,
    isToggling,
    toggleFavorite
  };
};
