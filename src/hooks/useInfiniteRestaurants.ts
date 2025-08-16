import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type_name?: string;
  services: string[];
  favorites_count: number;
  cover_image_url?: string;
  logo_url?: string;
}

interface UseInfiniteRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: readonly ("€" | "€€" | "€€€" | "€€€€")[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  isBudgetFriendly?: boolean;
  itemsPerPage?: number;
  enabled?: boolean;
}

export const useInfiniteRestaurants = ({
  searchQuery = '',
  userLat,
  userLng,
  maxDistance = 50,
  cuisineTypeIds,
  priceRanges,
  isHighRated = false,
  selectedEstablishmentTypes,
  selectedDietTypes,
  isOpenNow = false,
  isBudgetFriendly = false,
  itemsPerPage = 20,
  enabled = true
}: UseInfiniteRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<string>('');

  // Create stable key for fetch parameters including enabled flag
  const fetchKey = JSON.stringify({
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly,
    enabled
  });

  const fetchRestaurants = useCallback(async (
    page: number, 
    signal: AbortSignal,
    append: boolean = false
  ) => {
    try {
      console.log('useInfiniteRestaurants: Fetching page', page, 'append:', append);
      
      const offset = page * itemsPerPage;
      
      let query = supabase
        .from('restaurants')
        .select(`
          id,
          name,
          slug,
          description,
          price_range,
          google_rating,
          google_rating_count,
          latitude,
          longitude,
          favorites_count,
          cover_image_url,
          logo_url,
          establishment_types!inner(name),
          restaurant_cuisines!inner(
            cuisine_types!inner(name)
          ),
          restaurant_services(
            services!inner(name)
          )
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null);

      // Apply filters (same as useOptimizedRestaurants)
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (isHighRated) {
        query = query.gte('google_rating', 4.5);
      }

      if (isBudgetFriendly) {
        query = query.eq('price_range', '€');
      } else if (priceRanges?.length) {
        const priceRangeArray = priceRanges.filter((range): range is "€" | "€€" | "€€€" | "€€€€" => 
          range === "€" || range === "€€" || range === "€€€" || range === "€€€€"
        );
        if (priceRangeArray.length > 0) {
          query = query.in('price_range', priceRangeArray);
        }
      }

      if (selectedEstablishmentTypes?.length) {
        query = query.in('establishment_type_id', selectedEstablishmentTypes);
      }

      if (cuisineTypeIds?.length) {
        query = query.in('restaurant_cuisines.cuisine_type_id', cuisineTypeIds);
      }

      // Pagination
      query = query.range(offset, offset + itemsPerPage - 1);

      const { data, error: fetchError } = await query.abortSignal(signal);

      if (signal.aborted) return;

      if (fetchError) {
        console.error('useInfiniteRestaurants: Query error:', fetchError);
        throw fetchError;
      }

      console.log('useInfiniteRestaurants: Received', data?.length || 0, 'restaurants for page', page);

      const formattedRestaurants: Restaurant[] = (data || []).map((restaurant: any) => {
        // Calculate distance if user location is provided
        let distance_km: number | undefined;
        if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
          const R = 6371; // Earth's radius in km
          const dLat = (restaurant.latitude - userLat) * Math.PI / 180;
          const dLon = (restaurant.longitude - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(userLat * Math.PI / 180) * Math.cos(restaurant.latitude * Math.PI / 180) *
                   Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          distance_km = Math.round((R * c) * 100) / 100;
        }

        // Filter by distance if needed
        if (userLat && userLng && distance_km && distance_km > maxDistance) {
          return null;
        }

        return {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          price_range: restaurant.price_range,
          google_rating: restaurant.google_rating,
          google_rating_count: restaurant.google_rating_count,
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          distance_km,
          cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
          establishment_type_name: restaurant.establishment_types?.name,
          services: restaurant.restaurant_services?.map((rs: any) => rs.services?.name).filter(Boolean) || [],
          favorites_count: restaurant.favorites_count || 0,
          cover_image_url: restaurant.cover_image_url,
          logo_url: restaurant.logo_url
        };
      }).filter(Boolean);

      if (!signal.aborted) {
        const newHasMore = formattedRestaurants.length === itemsPerPage;
        setHasMore(newHasMore);
        
        if (append) {
          setRestaurants(prev => [...prev, ...formattedRestaurants]);
          setLoadingMore(false);
        } else {
          setRestaurants(formattedRestaurants);
          setLoading(false);
        }
        
        setError(null);
        lastFetchRef.current = fetchKey;
      }

    } catch (err) {
      if (signal.aborted) return;
      
      console.error('useInfiniteRestaurants: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      
      if (append) {
        setLoadingMore(false);
      } else {
        setRestaurants([]);
        setLoading(false);
      }
    }
  }, [fetchKey, searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, isHighRated, selectedEstablishmentTypes, selectedDietTypes, isOpenNow, isBudgetFriendly, itemsPerPage]);

  // Initial fetch or when filters change - now respects enabled flag
  useEffect(() => {
    // Don't fetch if disabled
    if (!enabled) {
      console.log('useInfiniteRestaurants: Fetch disabled, waiting for location...');
      return;
    }

    // Skip if parameters haven't changed
    if (lastFetchRef.current === fetchKey && restaurants.length > 0) {
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
        fetchRestaurants(0, currentController.signal, false);
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
  }, [fetchKey, fetchRestaurants, enabled]);

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

    fetchRestaurants(nextPage, currentController.signal, true);
  }, [currentPage, hasMore, loading, loadingMore, fetchRestaurants]);

  // Handle favorites updates (same as useOptimizedRestaurants)
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    const channel = supabase
      .channel('restaurants-favorites-infinite')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            setRestaurants(prev =>
              prev.map(r => 
                r.id === restaurantId 
                  ? { ...r, favorites_count: Math.max(0, newFavoritesCount) }
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      supabase.removeChannel(channel);
    };
  }, []);

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
    restaurants, 
    loading: enabled ? loading : false, 
    loadingMore,
    error, 
    hasMore: enabled ? hasMore : false,
    loadMore,
    totalLoaded: restaurants.length
  };
};
