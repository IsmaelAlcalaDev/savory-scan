
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Dish } from '@/hooks/useRestaurantMenu';

export { type Dish } from '@/hooks/useRestaurantMenu';

export const useRestaurantDishes = (restaurantId: number) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      console.log('useRestaurantDishes: No restaurantId provided');
      setDishes([]);
      setLoading(false);
      return;
    }

    console.log('useRestaurantDishes: Fetching dishes for restaurantId:', restaurantId);

    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('useRestaurantDishes: Making query to dishes table with restaurant_id:', restaurantId);

        // Query dishes with custom tags from junction table
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
            allergens,
            category_id,
            dish_categories!dishes_category_id_fkey(name),
            dish_variants(id, name, price, is_default, display_order),
            dish_custom_tags(
              restaurant_custom_tags(name)
            )
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('is_featured', { ascending: false })
          .order('name');

        console.log('useRestaurantDishes: Query result:', { dishesData, dishesError });

        if (dishesError) {
          console.error('useRestaurantDishes: Query error:', dishesError);
          throw dishesError;
        }

        console.log('useRestaurantDishes: Raw dishes data:', dishesData);
        console.log('useRestaurantDishes: Number of dishes found:', dishesData?.length || 0);

        const formattedDishes = (dishesData || []).map(dish => {
          console.log('useRestaurantDishes: Processing dish:', dish);
          return {
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
            allergens: Array.isArray(dish.allergens) ? dish.allergens as string[] : [],
            custom_tags: (dish.dish_custom_tags || []).map((dct: any) => dct.restaurant_custom_tags?.name).filter(Boolean),
            variants: (dish.dish_variants || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((variant: any) => ({
                id: variant.id,
                name: variant.name,
                price: variant.price,
                is_default: variant.is_default
              }))
          };
        });

        console.log('useRestaurantDishes: Formatted dishes:', formattedDishes);
        setDishes(formattedDishes);
      } catch (err) {
        console.error('useRestaurantDishes: Error fetching dishes:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar platos');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  console.log('useRestaurantDishes: Hook state:', { dishes: dishes.length, loading, error });

  return { dishes, loading, error };
};
