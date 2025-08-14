
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DishFavoriteToggleResult {
  success: boolean;
  isFavorite: boolean;
  newCount: number;
  error?: string;
}

export class DishFavoritesService {
  /**
   * Toggle favorite status for a dish
   */
  static async toggleDishFavorite(
    dishId: number,
    savedFrom: string = 'button'
  ): Promise<DishFavoriteToggleResult> {
    try {
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Usuario no autenticado');
      }

      const userId = session.user.id;

      // Check current favorite status
      const { data: existingFavorite, error: checkError } = await supabase
        .from('user_saved_dishes')
        .select('is_active')
        .eq('user_id', userId)
        .eq('dish_id', dishId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking dish favorite status:', checkError);
        throw new Error('Error al verificar estado de favorito');
      }

      let newIsFavorite: boolean;

      if (!existingFavorite) {
        // Create new favorite
        const { error: insertError } = await supabase
          .from('user_saved_dishes')
          .insert({
            user_id: userId,
            dish_id: dishId,
            is_active: true,
            saved_from: savedFrom,
            saved_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating dish favorite:', insertError);
          throw new Error('Error al guardar plato favorito');
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
          .from('user_saved_dishes')
          .update(updateData)
          .eq('user_id', userId)
          .eq('dish_id', dishId);

        if (updateError) {
          console.error('Error updating dish favorite:', updateError);
          throw new Error('Error al actualizar plato favorito');
        }
      }

      // Wait a moment for triggers to complete, then get the updated count
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the updated favorites_count from dishes table (after triggers have run)
      const { data: updatedDish, error: getDishError } = await supabase
        .from('dishes')
        .select('favorites_count')
        .eq('id', dishId)
        .single();

      if (getDishError) {
        console.error('Error getting updated dish:', getDishError);
        throw new Error('Error al obtener datos actualizados del plato');
      }

      const newCount = updatedDish.favorites_count || 0;

      // Dispatch custom event for real-time UI updates
      window.dispatchEvent(new CustomEvent('dishFavoriteToggled', {
        detail: {
          dishId,
          isFavorite: newIsFavorite,
          newCount,
          userId
        }
      }));

      // Show success toast
      toast({
        title: newIsFavorite ? "Plato guardado" : "Eliminado de favoritos",
        description: newIsFavorite 
          ? "El plato se ha añadido a tus favoritos" 
          : "El plato se ha eliminado de tus favoritos"
      });

      return {
        success: true,
        isFavorite: newIsFavorite,
        newCount
      };

    } catch (error) {
      console.error('Error in toggleDishFavorite:', error);
      
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
   * Check if a dish is favorited by the current user
   */
  static async isDishFavorited(dishId: number): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return false;
      }

      const { data, error } = await supabase
        .from('user_saved_dishes')
        .select('is_active')
        .eq('user_id', session.user.id)
        .eq('dish_id', dishId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking if dish is favorited:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isDishFavorited:', error);
      return false;
    }
  }

  /**
   * Load all dish favorites for the current user
   */
  static async loadUserDishFavorites(): Promise<number[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_saved_dishes')
        .select('dish_id')
        .eq('user_id', session.user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading user dish favorites:', error);
        return [];
      }

      return data?.map(item => item.dish_id) || [];
    } catch (error) {
      console.error('Error in loadUserDishFavorites:', error);
      return [];
    }
  }
}
