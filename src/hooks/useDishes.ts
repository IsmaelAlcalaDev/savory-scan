import { useEffect, useMemo, useState } from 'react';
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

  // Mapeo de slugs de dieta a campos booleanos de la vista
  const dietSlugToField: Record<string, keyof Dish> = useMemo(() => ({
    vegetarian: 'is_vegetarian',
    vegetariano: 'is_vegetarian',
    vegan: 'is_vegan',
    vegano: 'is_vegan',
    'gluten_free': 'is_gluten_free',
    'sin-gluten': 'is_gluten_free',
    'lactose_free': 'is_lactose_free',
    'sin-lactosa': 'is_lactose_free',
    healthy: 'is_healthy',
    saludable: 'is_healthy',
  }), []);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        console.info('Fetching dishes from dishes_full view with filters:', {
          searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, categoryIds, dietFilters, priceRangeIds, orderBy
        });

        // Select only existing columns on the dishes_full view
        let query = supabase
          .from('dishes_full')
          .select('id, name, base_price, image_url, restaurant_id, restaurant_name, restaurant_slug, category_id, category_name, diet_types');

        if (searchQuery && searchQuery.trim().length > 0) {
          query = query.ilike('name', `%${searchQuery.trim()}%`);
        }

        if (categoryIds && categoryIds.length > 0) {
          query = query.in('category_id', categoryIds);
        }

        const { data, error } = await query
          .limit(200)
          .returns<Array<{
            id: number;
            name: string;
            base_price: number;
            image_url: string | null;
            restaurant_id: number;
            restaurant_name: string;
            restaurant_slug: string;
            category_id: number | null;
            category_name: string | null;
            diet_types: any; // jsonb from view (usually string[])
          }>>();

        if (error) {
          console.error('Supabase error fetching dishes (dishes_full):', error);
          throw error;
        }

        const rows = data ?? [];

        // Helper: normalize diet_types jsonb to array<string>
        const normalizeDietArray = (val: any): string[] => {
          if (!val) return [];
          if (Array.isArray(val)) {
            return val
              .map((x) => (typeof x === 'string' ? x.toLowerCase() : ''))
              .filter(Boolean);
          }
          // If it's an object or string, try to coerce
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                return parsed
                  .map((x) => (typeof x === 'string' ? x.toLowerCase() : ''))
                  .filter(Boolean);
              }
              return [];
            } catch {
              return [val.toLowerCase()];
            }
          }
          return [];
        };

        // Client-side filter by diet using diet_types
        const dietSet = new Set((dietFilters ?? []).map((d) => d.toLowerCase()));
        const filteredByDiet = rows.filter((row) => {
          if (dietSet.size === 0) return true;
          const diets = normalizeDietArray(row.diet_types);
          const has = (slug: string) => diets.includes(slug);
          // require all selected slugs to be present
          for (const slug of dietSet) {
            // Support common aliases
            const match =
              (slug === 'vegetarian' || slug === 'vegetariano') ? has('vegetarian') :
              (slug === 'vegan' || slug === 'vegano') ? has('vegan') :
              (slug === 'gluten_free' || slug === 'sin-gluten') ? has('gluten_free') :
              (slug === 'lactose_free' || slug === 'sin-lactosa') ? has('lactose_free') :
              (slug === 'healthy' || slug === 'saludable') ? has('healthy') :
              has(slug);
            if (!match) return false;
          }
          return true;
        });

        // Cuisine filtering not available in view -> keep as-is for now
        const filteredByCuisine = filteredByDiet;

        const formatted: Dish[] = filteredByCuisine.map((row) => {
          const diets = normalizeDietArray(row.diet_types);
          const has = (slug: string) => diets.includes(slug);

          return {
            id: row.id,
            name: row.name,
            base_price: Number(row.base_price ?? 0),
            image_url: row.image_url,
            restaurant_id: row.restaurant_id,
            restaurant_name: row.restaurant_name,
            restaurant_slug: row.restaurant_slug,
            distance_km: null, // not provided by view
            cuisine_types: [], // not available in this view
            category_id: row.category_id ?? null,
            category_name: row.category_name ?? null,
            // derive diet flags from diet_types jsonb
            is_vegetarian: has('vegetarian'),
            is_vegan: has('vegan'),
            is_gluten_free: has('gluten_free'),
            is_lactose_free: has('lactose_free'),
            is_healthy: has('healthy'),
            favorites_count: 0,
            favorites_count_week: 0,
            favorites_count_month: 0,
          };
        });

        // Sorting in client
        const sorted = [...formatted].sort((a, b) => {
          switch (orderBy) {
            case 'price_asc': return a.base_price - b.base_price;
            case 'price_desc': return b.base_price - a.base_price;
            case 'distance': return (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity);
            case 'relevance': 
            case 'popularity':
            default: return 0;
          }
        });

        setDishes(sorted);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, categoryIds, dietFilters, priceRangeIds, orderBy]);

  return { dishes, loading, error };
};
