
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Dish {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number;
  formatted_price: string;
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

interface UseInfiniteDishesProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  selectedDietTypes?: number[];
  selectedPriceRanges?: readonly ("€" | "€€" | "€€€" | "€€€€")[];
  itemsPerPage?: number;
}

export const useInfiniteDishes = ({
  searchQuery = '',
  userLat,
  userLng,
  selectedDietTypes,
  selectedPriceRanges,
  itemsPerPage = 20
}: UseInfiniteDishesProps) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
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

  const fetchDishes = useCallback(async (
    page: number, 
    signal: AbortSignal,
    append: boolean = false
  ) => {
    try {
      console.log('useInfiniteDishes: Fetching page', page, 'append:', append);
      
      const offset = page * itemsPerPage;
      
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
        const priceRanges = selectedPriceRanges.filter((range): range is "€" | "€€" | "€€€" | "€€€€" => 
          range === "€" || range === "€€" || range === "€€€" || range === "€€€€"
        );
        if (priceRanges.length > 0) {
          query = query.in('restaurants.price_range', priceRanges);
        }
      }

      // Pagination
      query = query.range(offset, offset + itemsPerPage - 1);

      const { data, error: fetchError } = await query.abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useInfiniteDishes: Query error:', fetchError);
        throw fetchError;
      }

      console.log('useInfiniteDishes: Received', data?.length || 0, 'dishes for page', page);

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
          formatted_price: `${dish.base_price.toFixed(2)}€`,
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
        const newHasMore = formattedDishes.length === itemsPerPage;
        setHasMore(newHasMore);
        
        if (append) {
          setDishes(prev => [...prev, ...formattedDishes]);
          setLoadingMore(false);
        } else {
          setDishes(formattedDishes);
          setLoading(false);
        }
        
        setError(null);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useInfiniteDishes: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar platos');
      
      if (append) {
        setLoadingMore(false);
      } else {
        setDishes([]);
        setLoading(false);
      }
    }
  }, [fetchKey, searchQuery, userLat, userLng, selectedDietTypes, selectedPriceRanges, itemsPerPage]);

  // Initial fetch or when filters change
  useEffect(() => {
    // Skip if parameters haven't changed
    if (lastFetchRef.current === fetchKey && dishes.length > 0) {
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
    setCurrentPage(0);

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    // Debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      if (!currentController.signal.aborted) {
        fetchDishes(0, currentController.signal, false);
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

  // Load more function
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    fetchDishes(nextPage, currentController.signal, true);
  }, [currentPage, hasMore, loading, loadingMore, fetchDishes]);

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

  return { 
    dishes, 
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMore,
    totalLoaded: dishes.length
  };
};
