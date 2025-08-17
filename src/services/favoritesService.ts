import { supabase } from '@/integrations/supabase/client';

interface FavoriteResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

import { notificationBroadcaster } from './notificationBroadcaster';

export class FavoritesService {
  static async loadUserFavorites(): Promise<number[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.warn('FavoritesService: No user found, returning empty favorites.');
        return [];
      }

      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('FavoritesService: Error fetching favorites:', error);
        return [];
      }

      const favoriteIds = data.map(item => item.restaurant_id);
      return favoriteIds;
    } catch (error) {
      console.error('FavoritesService: Unexpected error in loadUserFavorites:', error);
      return [];
    }
  }

  static async toggleRestaurantFavorite(
    restaurantId: number, 
    savedFrom: string = 'toggle'
  ): Promise<FavoriteResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if the restaurant is already in favorites
      const { data: existingFavoriteData, error: existingFavoriteError } = await supabase
        .from('user_saved_restaurants')
        .select('*')
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (existingFavoriteError && existingFavoriteError.code !== '404') {
        console.error('Error checking existing favorite:', existingFavoriteError);
        throw existingFavoriteError;
      }

      const existingFavorite = existingFavoriteData;

      let result;
      
      if (existingFavorite) {
        // Toggle existing favorite
        const newState = !existingFavorite.is_active;
        
        const { data, error } = await supabase
          .from('user_saved_restaurants')
          .update({ 
            is_active: newState,
            saved_from: savedFrom,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFavorite.id)
          .select('*, restaurants(name)')
          .single();

        if (error) throw error;
        
        // Send broadcast notification for new favorites
        if (newState && data) {
          const restaurantName = data.restaurants?.name || 'Restaurante';
          notificationBroadcaster.notifyFavoriteAdded(
            user.id, 
            restaurantName, 
            restaurantId
          );
        }

        result = { success: true, isFavorite: newState };
      } else {
        // Create new favorite
        const { data, error } = await supabase
          .from('user_saved_restaurants')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            is_active: true,
            saved_from: savedFrom
          })
          .select('*, restaurants(name)')
          .single();

        if (error) throw error;

        // Send broadcast notification for new favorite
        if (data) {
          const restaurantName = data.restaurants?.name || 'Restaurante';
          notificationBroadcaster.notifyFavoriteAdded(
            user.id, 
            restaurantName, 
            restaurantId
          );
        }

        result = { success: true, isFavorite: true };
      }

      console.log('FavoritesService: Toggle result:', result);
      return result;

    } catch (error: any) {
      console.error('FavoritesService: Error in toggleRestaurantFavorite:', error);
      return { 
        success: false, 
        error: error?.message || 'Unknown error occurred'
      };
    }
  }
}
