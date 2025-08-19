
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Dish, MenuSection } from '@/types/dish';

interface UseRestaurantMenuProps {
  restaurantId: number;
  searchQuery?: string;
  categoryId?: number;
  sectionId?: number;
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
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    restaurantId,
    searchQuery,
    categoryId,
    sectionId,
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
    if (restaurantId) {
      fetchMenu();
    }
  }, [
    restaurantId,
    searchQuery,
    categoryId,
    sectionId,
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

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('menu_sections')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('display_order');

      if (sectionsError) throw sectionsError;

      // Transform sections data
      const transformedSections: MenuSection[] = (sectionsData || []).map(section => ({
        ...section,
        dishes: []
      }));

      setSections(transformedSections);

      // Build dishes query
      let dishesQuery = supabase
        .from('dishes')
        .select(`
          *,
          dish_categories(name),
          menu_sections(name),
          dish_variants(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .is('deleted_at', null);

      // Apply filters
      if (sectionId) {
        dishesQuery = dishesQuery.eq('section_id', sectionId);
      }

      if (categoryId) {
        dishesQuery = dishesQuery.eq('category_id', categoryId);
      }

      if (searchQuery) {
        dishesQuery = dishesQuery.ilike('name', `%${searchQuery}%`);
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

      const { data: dishesData, error: dishesError } = await dishesQuery.order('name');

      if (dishesError) throw dishesError;

      // Transform dishes data
      let transformedDishes = (dishesData || []).map((dish: any) => ({
        ...dish,
        allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
        diet_types: Array.isArray(dish.diet_types) ? dish.diet_types : [],
        custom_tags: Array.isArray(dish.custom_tags) ? dish.custom_tags : [],
        variants: dish.dish_variants || []
      }));

      // Filter by custom tags if specified
      if (customTags && customTags.length > 0) {
        transformedDishes = transformedDishes.filter(dish => 
          dish.custom_tags && 
          Array.isArray(dish.custom_tags) &&
          customTags.some(tag => dish.custom_tags.includes(tag))
        );
      }

      setDishes(transformedDishes);

    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  return {
    sections,
    dishes,
    loading,
    error,
    refetch: fetchMenu
  };
};

export type { Dish, MenuSection };
