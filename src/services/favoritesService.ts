
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
      } else {
        // Toggle existing favorite
        newIsFavorite = !existingFavorite.is_active;
        
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

      // Recalculate favorites count
      const newCount = await this.recalculateFavoritesCount(restaurantId);

      // Try to update the restaurant's favorites_count in the database
      // Using increment/decrement instead of setting the exact count
      try {
        if (newIsFavorite) {
          // Increment the counter
          const { error: incrementError } = await supabase.rpc('increment_restaurant_favorites', {
            restaurant_id_param: restaurantId
          });
          
          if (incrementError) {
            // Fallback: try direct update with the calculated count
            await supabase
              .from('restaurants')
              .update({ favorites_count: newCount })
              .eq('id', restaurantId);
          }
        } else {
          // Decrement the counter
          const { error: decrementError } = await supabase.rpc('decrement_restaurant_favorites', {
            restaurant_id_param: restaurantId
          });
          
          if (decrementError) {
            // Fallback: try direct update with the calculated count
            await supabase
              .from('restaurants')
              .update({ favorites_count: Math.max(0, newCount) })
              .eq('id', restaurantId);
          }
        }
      } catch (updateError) {
        console.warn('Could not update restaurant favorites_count directly:', updateError);
        // Continue anyway, the UI will be updated via the custom event
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
