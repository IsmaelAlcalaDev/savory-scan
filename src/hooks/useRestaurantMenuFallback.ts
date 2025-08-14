
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type Dish, type MenuSection } from '@/hooks/useRestaurantMenu';

export const useRestaurantMenuFallback = (restaurantId: number) => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchMenuWithFallback = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get menu sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('menu_sections')
          .select('id, name, description, display_order')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('display_order');

        if (sectionsError) {
          throw sectionsError;
        }

        // Get all dishes for this restaurant
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
            section_id,
            dish_categories(name),
            dish_variants(id, name, price, is_default, display_order)
          `)
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .is('deleted_at', null);

        if (dishesError) {
          throw dishesError;
        }

        const dishes = (dishesData || []).map(dish => ({
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
          section_id: dish.section_id, // Added this property
          variants: (dish.dish_variants || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((variant: any) => ({
              id: variant.id,
              name: variant.name,
              price: variant.price,
              is_default: variant.is_default
            }))
        }));

        // If we have sections, use them
        if (sectionsData && sectionsData.length > 0) {
          const sectionsWithDishes = sectionsData.map(section => ({
            ...section,
            dishes: dishes.filter(dish => dish.section_id === section.id)
          }));
          setSections(sectionsWithDishes);
        } else {
          // Fallback: group dishes by category
          const dishesGroupedByCategory = dishes.reduce((acc, dish) => {
            const categoryName = dish.category_name || 'Sin categoría';
            if (!acc[categoryName]) {
              acc[categoryName] = [];
            }
            acc[categoryName].push(dish);
            return acc;
          }, {} as Record<string, Dish[]>);

          // Convert to sections format
          const fallbackSections = Object.entries(dishesGroupedByCategory).map(([categoryName, categoryDishes], index) => ({
            id: index + 1, // Temporary ID for fallback sections
            name: categoryName,
            description: undefined,
            display_order: index + 1,
            dishes: categoryDishes
          }));

          setSections(fallbackSections);
        }

      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar menú');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuWithFallback();
  }, [restaurantId]);

  return { sections, loading, error };
};
