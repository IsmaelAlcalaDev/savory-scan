
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

        // Usamos la vista existente "dishes_full"
        let query = supabase
          .from('dishes_full')
          .select('id, name, base_price, image_url, restaurant_id, restaurant_name, restaurant_slug, category_id, category_name, is_vegetarian, is_vegan, is_gluten_free, is_lactose_free, is_healthy');

        if (searchQuery && searchQuery.trim().length > 0) {
          query = query.ilike('name', `%${searchQuery.trim()}%`);
        }

        if (categoryIds && categoryIds.length > 0) {
          query = query.in('category_id', categoryIds);
        }

        // Nota: filtros por cocina y rangos de precio se aplicarán en cliente (no hay join disponible aquí)
        const { data, error } = await query.limit(200);

        if (error) {
          console.error('Supabase error fetching dishes (dishes_full):', error);
          throw error;
        }

        const rows: any[] = data ?? [];

        // Filtro cliente por dietas
        const dietSet = new Set((dietFilters ?? []).map((d) => d.toLowerCase()));
        const filteredByDiet = rows.filter((row) => {
          if (dietSet.size === 0) return true;
          // Requiere que todos los filtros estén en true
          for (const slug of dietSet) {
            const field = dietSlugToField[slug];
            if (!field) continue; // slug desconocido, lo ignoramos
            if (!row[field]) return false;
          }
          return true;
        });

        // Filtro cliente por cocinas (si la vista ofrece info, aquí no la tenemos -> ignoramos por ahora)
        const filteredByCuisine = filteredByDiet; // mantener igual por ahora

        // TODO: aplicar filtrado cliente por rangos de precio si se dispone de sus min/max en contexto

        const formatted: Dish[] = filteredByCuisine.map((row: any) => ({
          id: row.id,
          name: row.name,
          base_price: Number(row.base_price ?? 0),
          image_url: row.image_url,
          restaurant_id: row.restaurant_id,
          restaurant_name: row.restaurant_name,
          restaurant_slug: row.restaurant_slug,
          distance_km: null, // la vista no trae distancia
          cuisine_types: [], // no disponible en la vista
          category_id: row.category_id ?? null,
          category_name: row.category_name ?? null,
          is_vegetarian: !!row.is_vegetarian,
          is_vegan: !!row.is_vegan,
          is_gluten_free: !!row.is_gluten_free,
          is_lactose_free: !!row.is_lactose_free,
          is_healthy: !!row.is_healthy,
          favorites_count: 0,
          favorites_count_week: 0,
          favorites_count_month: 0,
        }));

        // Ordenaciones básicas en cliente
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
  }, [searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, categoryIds, dietFilters, priceRangeIds, orderBy, dietSlugToField]);

  return { dishes, loading, error };
};
