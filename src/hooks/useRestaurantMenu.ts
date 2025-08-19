
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseRestaurantMenuProps {
  restaurantSlug: string;
  sectionId?: number | null;
  categoryId?: number | null;
  searchQuery?: string;
  allergenIds?: number[];
  dietTypeIds?: number[];
  spiceLevel?: number;
  customTags?: string[];
  isHealthy?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isLactoseFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const useRestaurantMenu = (props: UseRestaurantMenuProps) => {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    restaurantSlug,
    sectionId,
    categoryId,
    searchQuery,
    allergenIds,
    dietTypeIds,
    spiceLevel,
    customTags,
    isHealthy,
    isVegetarian,
    isVegan,
    isGlutenFree,
    isLactoseFree,
    minPrice,
    maxPrice
  } = props;

  useEffect(() => {
    if (restaurantSlug) {
      fetchRestaurantMenu();
    }
  }, [
    restaurantSlug,
    sectionId,
    categoryId,
    searchQuery,
    JSON.stringify(allergenIds),
    JSON.stringify(dietTypeIds),
    spiceLevel,
    JSON.stringify(customTags),
    isHealthy,
    isVegetarian,
    isVegan,
    isGlutenFree,
    isLactoseFree,
    minPrice,
    maxPrice
  ]);

  const fetchRestaurantMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener información del restaurante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', restaurantSlug)
        .single();

      if (restaurantError) throw restaurantError;
      
      setRestaurant(restaurantData);

      // Obtener secciones del menú
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('menu_sections')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);

      // Construir query para platos
      let dishesQuery = supabase
        .from('dishes')
        .select(`
          *,
          dish_categories!inner(id, name, slug),
          menu_sections!inner(id, name),
          dish_variants(*)
        `)
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .is('deleted_at', null);

      // Aplicar filtros
      if (sectionId) {
        dishesQuery = dishesQuery.eq('section_id', sectionId);
      }

      if (categoryId) {
        dishesQuery = dishesQuery.eq('category_id', categoryId);
      }

      if (searchQuery) {
        dishesQuery = dishesQuery.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (spiceLevel !== undefined) {
        dishesQuery = dishesQuery.eq('spice_level', spiceLevel);
      }

      if (isHealthy) {
        dishesQuery = dishesQuery.eq('is_healthy', true);
      }

      if (isVegetarian) {
        dishesQuery = dishesQuery.eq('is_vegetarian', true);
      }

      if (isVegan) {
        dishesQuery = dishesQuery.eq('is_vegan', true);
      }

      if (isGlutenFree) {
        dishesQuery = dishesQuery.eq('is_gluten_free', true);
      }

      if (isLactoseFree) {
        dishesQuery = dishesQuery.eq('is_lactose_free', true);
      }

      if (minPrice !== undefined) {
        dishesQuery = dishesQuery.gte('base_price', minPrice);
      }

      if (maxPrice !== undefined) {
        dishesQuery = dishesQuery.lte('base_price', maxPrice);
      }

      dishesQuery = dishesQuery.order('section_id').order('name');

      const { data: dishesData, error: dishesError } = await dishesQuery;

      if (dishesError) throw dishesError;

      // Filtrar por custom tags si se especifican
      let filteredDishes = dishesData || [];
      if (customTags && customTags.length > 0) {
        filteredDishes = filteredDishes.filter(dish => 
          dish.custom_tags && 
          Array.isArray(dish.custom_tags) &&
          customTags.some(tag => dish.custom_tags.includes(tag))
        );
      }

      setDishes(filteredDishes);
    } catch (err) {
      console.error('Error fetching restaurant menu:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  return {
    restaurant,
    sections,
    dishes,
    loading,
    error,
    refetch: fetchRestaurantMenu
  };
};
