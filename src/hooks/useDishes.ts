
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Dish {
  id: number;
  name: string;
  base_price: number;
  image_url?: string | null;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  distance_km?: number | null;
  cuisine_types: string[];
  category_id?: number | null;
  category_name?: string | null;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_lactose_free?: boolean;
  is_healthy?: boolean;
  favorites_count: number;
  favorites_count_week: number;
  favorites_count_month: number;
}

interface UseDishesProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  categoryIds?: number[];
  dietFilters?: string[];
  priceRangeIds?: number[];
  orderBy?: 'relevance' | 'distance' | 'price_asc' | 'price_desc' | 'popularity';
}

export const useDishes = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  categoryIds,
  dietFilters,
  priceRangeIds,
  orderBy = 'popularity'
}: UseDishesProps) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.rpc('search_dishes_with_filters', {
          search_query: searchQuery,
          user_lat: userLat ?? null,
          user_lng: userLng ?? null,
          max_distance_km: maxDistance,
          cuisine_type_ids: cuisineTypeIds?.length ? cuisineTypeIds : null,
          category_ids: categoryIds?.length ? categoryIds : null,
          diet_filters: dietFilters?.length ? dietFilters : null,
          exclude_allergen_slugs: null,
          price_range_ids: priceRangeIds?.length ? priceRangeIds : null,
          order_by: orderBy,
          limit_count: 50,
          offset_count: 0,
        });

        if (error) {
          console.error('Supabase error fetching dishes:', error);
          throw error;
        }

        const formatted: Dish[] = (data || []).map((row: any) => ({
          id: row.dish_id,
          name: row.dish_name,
          base_price: row.base_price,
          image_url: row.image_url,
          restaurant_id: row.restaurant_id,
          restaurant_name: row.restaurant_name,
          restaurant_slug: row.restaurant_slug,
          distance_km: row.distance_km,
          cuisine_types: row.cuisine_types || [],
          category_id: row.category_id,
          category_name: row.category_name,
          is_vegetarian: row.is_vegetarian,
          is_vegan: row.is_vegan,
          is_gluten_free: row.is_gluten_free,
          is_lactose_free: row.is_lactose_free,
          is_healthy: row.is_healthy,
          favorites_count: row.favorites_count ?? 0,
          favorites_count_week: row.favorites_count_week ?? 0,
          favorites_count_month: row.favorites_count_month ?? 0,
        }));

        setDishes(formatted);
      } catch (e) {
        console.error('Error fetching dishes:', e);
        setError(e instanceof Error ? e.message : 'Error al cargar platos');
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();

    // Realtime para actualizar contador de favoritos en tarjetas
    const channel = supabase
      .channel('dishes-favorites')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_saved_dishes' },
        (payload) => {
          console.log('Dish favorite change detected (list hook):', payload);
          if (payload.new && typeof payload.new === 'object' && 'dish_id' in payload.new) {
            const dishId = (payload.new as any).dish_id;
            setDishes(prev =>
              prev.map(d => {
                if (d.id !== dishId) return d;
                // calcular incremento según evento
                const increment =
                  payload.eventType === 'INSERT' && (payload.new as any).is_active ? 1 :
                  payload.eventType === 'UPDATE' && payload.old &&
                  (payload.old as any).is_active !== (payload.new as any).is_active
                    ? ((payload.new as any).is_active ? 1 : -1)
                    : 0;
                return { ...d, favorites_count: Math.max(0, d.favorites_count + increment) };
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, categoryIds, dietFilters, priceRangeIds, orderBy]);

  return { dishes, loading, error };
};
