
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Dish {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_healthy: boolean;
  favorites_count: number;
  distance_km?: number;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface UseOptimizedDishesProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  selectedDietTypes?: number[];
  selectedPriceRanges?: string[];
}

export const useOptimizedDishes = ({
  searchQuery = '',
  userLat,
  userLng,
  selectedDietTypes,
  selectedPriceRanges
}: UseOptimizedDishesProps) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<string>('');

  // Create stable key for fetch parameters
  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedPriceRanges
  });

  const fetchDishes = useCallback(async (signal: AbortSignal) => {
    try {
      console.log('useOptimizedDishes: Starting optimized fetch');
      
      let query = supabase
        .from('dishes')
        .select(`
          id,
          name,
          description,
          image_url,
          base_price,
          restaurant_id,
          is_vegetarian,
          is_vegan,
          is_gluten_free,
          is_healthy,
          favorites_count,
          restaurants!inner(
            name,
            slug,
            latitude,
            longitude,
            price_range,
            is_active,
            is_published,
            deleted_at
          ),
          dish_variants(
            id,
            name,
            price
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null)
        .eq('restaurants.is_active', true)
        .eq('restaurants.is_published', true)
        .is('restaurants.deleted_at', null);

      // Apply search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply diet filters
      if (selectedDietTypes?.length) {
        const dietConditions = selectedDietTypes.map(dietId => {
          // This is a simplified approach - in production you'd want to 
          // map diet type IDs to their actual categories
          switch (dietId) {
            case 1: return 'is_vegetarian.eq.true';
            case 2: return 'is_vegan.eq.true';
            case 3: return 'is_gluten_free.eq.true';
            case 4: return 'is_healthy.eq.true';
            default: return null;
          }
        }).filter(Boolean);
        
        if (dietConditions.length > 0) {
          query = query.or(dietConditions.join(','));
        }
      }

      // Apply price range filter
      if (selectedPriceRanges?.length) {
        query = query.in('restaurants.price_range', selectedPriceRanges);
      }

      // Limit results
      query = query.limit(50);

      const { data, error: fetchError } = await query.abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useOptimizedDishes: Query error:', fetchError);
        throw fetchError;
      }

      console.log('useOptimizedDishes: Received', data?.length || 0, 'dishes');

      const formattedDishes: Dish[] = (data || []).map((dish: any) => {
        // Calculate distance if user location is provided
        let distance_km: number | undefined;
        if (userLat && userLng && dish.restaurants?.latitude && dish.restaurants?.longitude) {
          const R = 6371; // Earth's radius in km
          const dLat = (dish.restaurants.latitude - userLat) * Math.PI / 180;
          const dLon = (dish.restaurants.longitude - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(userLat * Math.PI / 180) * Math.cos(dish.restaurants.latitude * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance_km = Math.round((R * c) * 100) / 100;
        }

        return {
          id: dish.id,
          name: dish.name,
          description: dish.description,
          image_url: dish.image_url,
          base_price: dish.base_price,
          restaurant_id: dish.restaurant_id,
          restaurant_name: dish.restaurants?.name || '',
          restaurant_slug: dish.restaurants?.slug || '',
          is_vegetarian: dish.is_vegetarian || false,
          is_vegan: dish.is_vegan || false,
          is_gluten_free: dish.is_gluten_free || false,
          is_healthy: dish.is_healthy || false,
          favorites_count: dish.favorites_count || 0,
          distance_km,
          variants: dish.dish_variants?.map((variant: any) => ({
            id: variant.id,
            name: variant.name,
            price: variant.price
          })) || []
        };
      });

      // Sort by distance if available
      if (userLat && userLng) {
        formattedDishes.sort((a, b) => {
          if (!a.distance_km && !b.distance_km) return 0;
          if (!a.distance_km) return 1;
          if (!b.distance_km) return -1;
          return a.distance_km - b.distance_km;
        });
      }

      if (!signal.aborted) {
        setDishes(formattedDishes);
        setError(null);
        setLoading(false);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useOptimizedDishes: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar platos');
      setDishes([]);
      setLoading(false);
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedDietTypes, selectedPriceRanges]);

  useEffect(() => {
    // Skip if parameters haven't changed
    if (lastFetchRef.current === fetchKey) {
      return;
    }

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    // Debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      if (!currentController.signal.aborted) {
        fetchDishes(currentController.signal);
      }
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (currentController) {
        currentController.abort();
      }
    };
  }, [fetchKey, fetchDishes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return { dishes, loading, error };
};
