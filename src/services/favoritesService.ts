import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FavoriteToggleResult {
  success: boolean;
  isFavorite: boolean;
  newCount: number;
  error?: string;
}

export class FavoritesService {
  /**
   * Toggle favorite status for a restaurant
   */
  static async toggleRestaurantFavorite(
    restaurantId: number,
    savedFrom: string = 'button'
  ): Promise<FavoriteToggleResult> {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Usuario no autenticado');
      }

      const userId = session.user.id;

      // Check current favorite status
      const { data: existingFavorite, error: checkError } = await supabase
        .from('user_saved_restaurants')
        .select('is_active')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking favorite status:', checkError);
        throw new Error('Error al verificar estado de favorito');
      }

      let newIsFavorite: boolean;
      let countChange = 0;

      if (!existingFavorite) {
        // Create new favorite
        const { error: insertError } = await supabase
          .from('user_saved_restaurants')
          .insert({
            user_id: userId,
            restaurant_id: restaurantId,
            is_active: true,
            saved_from: savedFrom,
            saved_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating favorite:', insertError);
          throw new Error('Error al guardar favorito');
        }

        newIsFavorite = true;
        countChange = 1;
      } else {
        // Toggle existing favorite
        newIsFavorite = !existingFavorite.is_active;
        countChange = newIsFavorite ? 1 : -1;
        
        const updateData = newIsFavorite
          ? {
              is_active: true,
              saved_from: savedFrom,
              saved_at: new Date().toISOString(),
              unsaved_at: null
            }
          : {
              is_active: false,
              unsaved_at: new Date().toISOString()
            };

        const { error: updateError } = await supabase
          .from('user_saved_restaurants')
          .update(updateData)
          .eq('user_id', userId)
          .eq('restaurant_id', restaurantId);

        if (updateError) {
          console.error('Error updating favorite:', updateError);
          throw new Error('Error al actualizar favorito');
        }
      }

      // Get current favorites_count and update it
      const { data: currentRestaurant, error: getRestaurantError } = await supabase
        .from('restaurants')
        .select('favorites_count')
        .eq('id', restaurantId)
        .single();

      if (getRestaurantError) {
        console.error('Error getting restaurant:', getRestaurantError);
        throw new Error('Error al obtener datos del restaurante');
      }

      const currentCount = currentRestaurant.favorites_count || 0;
      const newCount = Math.max(0, currentCount + countChange);

      // Update the favorites_count in restaurants table
      const { error: updateCountError } = await supabase
        .from('restaurants')
        .update({ favorites_count: newCount })
        .eq('id', restaurantId);

      if (updateCountError) {
        console.error('Error updating favorites count:', updateCountError);
        throw new Error('Error al actualizar contador de favoritos');
      }

      // Dispatch custom event for real-time UI updates
      window.dispatchEvent(new CustomEvent('favoriteToggled', {
        detail: {
          restaurantId,
          isFavorite: newIsFavorite,
          newCount,
          userId
        }
      }));

      // Show success toast
      toast({
        title: newIsFavorite ? "Restaurante guardado" : "Eliminado de favoritos",
        description: newIsFavorite 
          ? "El restaurante se ha añadido a tus favoritos" 
          : "El restaurante se ha eliminado de tus favoritos"
      });

      return {
        success: true,
        isFavorite: newIsFavorite,
        newCount
      };

    } catch (error) {
      console.error('Error in toggleRestaurantFavorite:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el favorito",
        variant: "destructive"
      });

      return {
        success: false,
        isFavorite: false,
        newCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Recalculate favorites count for a restaurant
   */
  private static async recalculateFavoritesCount(restaurantId: number): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_saved_restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true);

      if (error) {
        console.error('Error counting favorites:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in recalculateFavoritesCount:', error);
      return 0;
    }
  }

  /**
   * Check if a restaurant is favorited by the current user
   */
  static async isRestaurantFavorited(restaurantId: number): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('is_active')
        .eq('user_id', session.user.id)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking if restaurant is favorited:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isRestaurantFavorited:', error);
      return false;
    }
  }

  /**
   * Load all favorites for the current user
   */
  static async loadUserFavorites(): Promise<number[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_saved_restaurants')
        .select('restaurant_id')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading user favorites:', error);
        return [];
      }

      return data?.map(item => item.restaurant_id) || [];
    } catch (error) {
      console.error('Error in loadUserFavorites:', error);
      return [];
    }
  }
}
