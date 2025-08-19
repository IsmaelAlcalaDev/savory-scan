
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MenuSection {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  dishes: Dish[];
}

export interface Dish {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  is_healthy: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  favorites_count: number;
  category_name?: string;
  allergens?: string[];
  custom_tags?: string[];
  variants: Array<{
    id: number;
    name: string;
    price: number;
    is_default: boolean;
  }>;
}

export const useRestaurantMenu = (restaurantId: number) => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get menu sections
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

        // Get dishes for all sections
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
            custom_tags,
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

        // Group dishes by section
        const sectionsWithDishes = (sectionsData || []).map(section => ({
          ...section,
          dishes: (dishesData || [])
            .filter(dish => dish.section_id === section.id)
            .map(dish => ({
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
              custom_tags: Array.isArray(dish.custom_tags) ? dish.custom_tags as string[] : [],
              variants: (dish.dish_variants || [])
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((variant: any) => ({
                  id: variant.id,
                  name: variant.name,
                  price: variant.price,
                  is_default: variant.is_default
                }))
            }))
        }));

        setSections(sectionsWithDishes);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar menú');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  return { sections, loading, error };
};
