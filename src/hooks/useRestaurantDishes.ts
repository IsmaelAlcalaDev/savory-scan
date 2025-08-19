
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseDishesProps {
  restaurantId: number;
  categoryId?: number;
  sectionId?: number;
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

export const useRestaurantDishes = (props: UseDishesProps) => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    restaurantId,
    categoryId,
    sectionId,
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
    fetchDishes();
  }, [
    restaurantId,
    categoryId,
    sectionId,
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

  const fetchDishes = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('dishes')
        .select(`
          *,
          dish_categories!inner(name),
          menu_sections!inner(name),
          dish_variants(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('name');

      // Aplicar filtros
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (spiceLevel !== undefined) {
        query = query.eq('spice_level', spiceLevel);
      }

      if (isHealthy) {
        query = query.eq('is_healthy', true);
      }

      if (isVegetarian) {
        query = query.eq('is_vegetarian', true);
      }

      if (isVegan) {
        query = query.eq('is_vegan', true);
      }

      if (isGlutenFree) {
        query = query.eq('is_gluten_free', true);
      }

      if (isLactoseFree) {
        query = query.eq('is_lactose_free', true);
      }

      if (minPrice !== undefined) {
        query = query.gte('base_price', minPrice);
      }

      if (maxPrice !== undefined) {
        query = query.lte('base_price', maxPrice);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filtrar por custom tags si se especifican
      let filteredData = data || [];
      if (customTags && customTags.length > 0) {
        filteredData = filteredData.filter(dish => 
          dish.custom_tags && 
          Array.isArray(dish.custom_tags) &&
          customTags.some(tag => dish.custom_tags.includes(tag))
        );
      }

      setDishes(filteredData);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar platos');
    } finally {
      setLoading(false);
    }
  };

  return { dishes, loading, error, refetch: fetchDishes };
};
