
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Dish } from '@/hooks/useRestaurantMenu';

export const useRestaurantDishes = (restaurantId: number) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            base_price,
            image_url,
            image_alt,
            is_featured,
            is_vegetarian,
            is_vegan,
            is_gluten_free,
            is_lactose_free,
            is_healthy,
            spice_level,
            preparation_time_minutes,
            favorites_count,
            dish_categories(name),
            dish_variants(id, name, price, is_default, display_order)
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .is('deleted_at', null);

        if (dishesError) {
          throw dishesError;
        }

        const formattedDishes = (dishesData || []).map(dish => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          base_price: dish.base_price,
          image_url: dish.image_url,
          image_alt: dish.image_alt,
          is_featured: dish.is_featured,
          is_vegetarian: dish.is_vegetarian,
          is_vegan: dish.is_vegan,
          is_gluten_free: dish.is_gluten_free,
          is_lactose_free: dish.is_lactose_free,
          is_healthy: dish.is_healthy,
          spice_level: dish.spice_level,
          preparation_time_minutes: dish.preparation_time_minutes,
          favorites_count: dish.favorites_count,
          category_name: dish.dish_categories?.name,
          variants: (dish.dish_variants || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((variant: any) => ({
              id: variant.id,
              name: variant.name,
              price: variant.price,
              is_default: variant.is_default
            }))
        }));

        setDishes(formattedDishes);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar platos');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  return { dishes, loading, error };
};
