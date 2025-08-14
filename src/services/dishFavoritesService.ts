
import { supabase } from '@/integrations/supabase/client';

export interface UserDishFavorite {
  id: string;
  user_id: string;
  dish_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const dishFavoritesService = {
  async toggleDishFavorite(dishId: number, savedFrom: string = 'unknown'): Promise<{ success: boolean; isNowFavorite: boolean; newCount: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('dishFavoritesService: Toggling favorite for dish:', dishId);

      // Check if already favorited
      const { data: existingFavorite, error: checkError } = await supabase
        .from('user_saved_dishes')
        .select('*')
        .eq('user_id', user.id)
        .eq('dish_id', dishId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('dishFavoritesService: Error checking existing favorite:', checkError);
        throw checkError;
      }

      let isNowFavorite = false;
      let favoriteRecord = existingFavorite;

      if (existingFavorite) {
        // Toggle existing record
        const newActiveState = !existingFavorite.is_active;
        const { data: updatedRecord, error: updateError } = await supabase
          .from('user_saved_dishes')
          .update({ 
            is_active: newActiveState,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingFavorite.id)
          .select()
          .single();

        if (updateError) {
          console.error('dishFavoritesService: Error updating favorite:', updateError);
          throw updateError;
        }

        isNowFavorite = newActiveState;
        favoriteRecord = updatedRecord;
      } else {
        // Create new favorite record
        const { data: newRecord, error: insertError } = await supabase
          .from('user_saved_dishes')
          .insert({
            user_id: user.id,
            dish_id: dishId,
            is_active: true,
            saved_from: savedFrom
          })
          .select()
          .single();

        if (insertError) {
          console.error('dishFavoritesService: Error creating favorite:', insertError);
          throw insertError;
        }

        isNowFavorite = true;
        favoriteRecord = newRecord;
      }

      // Now update the dish favorites count manually
      const { data: dish, error: dishError } = await supabase
        .from('dishes')
        .select('favorites_count')
        .eq('id', dishId)
        .single();

      if (dishError) {
        console.error('dishFavoritesService: Error fetching dish:', dishError);
        throw dishError;
      }

      const currentCount = dish.favorites_count || 0;
      const newCount = Math.max(0, currentCount + (isNowFavorite ? 1 : -1));

      const { error: updateCountError } = await supabase
        .from('dishes')
        .update({ favorites_count: newCount })
        .eq('id', dishId);

      if (updateCountError) {
        console.error('dishFavoritesService: Error updating favorites count:', updateCountError);
        throw updateCountError;
      }

      console.log('dishFavoritesService: Successfully toggled favorite:', { dishId, isNowFavorite, newCount });

      return {
        success: true,
        isNowFavorite,
        newCount
      };

    } catch (error) {
      console.error('dishFavoritesService: Error in toggleDishFavorite:', error);
      return {
        success: false,
        isNowFavorite: false,
        newCount: 0
      };
    }
  },

  async loadUserDishFavorites(): Promise<number[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_saved_dishes')
        .select('dish_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('dishFavoritesService: Error loading favorites:', error);
        return [];
      }

      return data.map(item => item.dish_id);
    } catch (error) {
      console.error('dishFavoritesService: Error in loadUserDishFavorites:', error);
      return [];
    }
  },

  async isDishFavorited(dishId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_saved_dishes')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('dish_id', dishId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No record found
        }
        console.error('dishFavoritesService: Error checking if favorited:', error);
        return false;
      }

      return data?.is_active || false;
    } catch (error) {
      console.error('dishFavoritesService: Error in isDishFavorited:', error);
      return false;
    }
  }
};
