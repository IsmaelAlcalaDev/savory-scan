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
  itemsPerPage = 20
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

  // Create stable key for fetch parameters (removed enabled)
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
    isBudgetFriendly
  });

  const fetchRestaurants = useCallback(async (
    page: number, 
    signal: AbortSignal,
    append: boolean = false
  ) => {
    try {
      console.log('useInfiniteRestaurants: Fetching page', page, 'append:', append, 'hasLocation:', !!userLat);
      
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

      // Apply filters
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

      // Order by location if available, otherwise by rating/popularity
      if (userLat && userLng) {
        // When we have location, we'll calculate distance and sort by it
        console.log('useInfiniteRestaurants: Ordering by distance from user location');
      } else {
        // When no location, order by rating and popularity
        query = query.order('google_rating', { ascending: false, nullsLast: true })
                    .order('favorites_count', { ascending: false });
        console.log('useInfiniteRestaurants: Ordering by rating and popularity (no location)');
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

        // NO LONGER FILTER BY DISTANCE - keep all restaurants
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
      });

      // If we have user location, sort by distance after formatting
      let sortedRestaurants = formattedRestaurants;
      if (userLat && userLng) {
        sortedRestaurants = formattedRestaurants.sort((a, b) => {
          // Restaurants with distance first, sorted by distance
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            return a.distance_km - b.distance_km;
          }
          // Restaurants without distance last, sorted by rating
          if (a.distance_km === undefined && b.distance_km === undefined) {
            return (b.google_rating || 0) - (a.google_rating || 0);
          }
          // Restaurants with distance always before those without
          return a.distance_km !== undefined ? -1 : 1;
        });
      }

      if (!signal.aborted) {
        const newHasMore = sortedRestaurants.length === itemsPerPage;
        setHasMore(newHasMore);
        
        if (append) {
          setRestaurants(prev => [...prev, ...sortedRestaurants]);
          setLoadingMore(false);
        } else {
          setRestaurants(sortedRestaurants);
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

  // Always fetch data - no longer conditional on enabled
  useEffect(() => {
    // Skip if parameters haven't changed
    if (lastFetchRef.current === fetchKey && restaurants.length > 0) {
      return;
    }

    console.log('useInfiniteRestaurants: Starting fetch, location:', { userLat, userLng });

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
  }, [fetchKey, fetchRestaurants]);

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

  // Handle favorites updates
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
    loading, 
    loadingMore,
    error, 
    hasMore,
    loadMore,
    totalLoaded: restaurants.length
  };
};
