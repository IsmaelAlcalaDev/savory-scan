
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchFeedItem {
  id: number;
  name: string;
  slug: string;
  distance_km?: number;
  google_rating?: number;
  google_rating_count?: number;
  price_range: string;
  cover_image_url?: string;
  logo_url?: string;
  cuisine_types: Array<{ id: number; name: string; slug: string }>;
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  vegan_pct: number;
  vegetarian_pct: number;
  glutenfree_pct: number;
  healthy_pct: number;
  items_total: number;
}

interface UseOptimizedSearchFeedRpcProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  minRating?: number;
  isOpenNow?: boolean;
  maxResults?: number;
}

// Cache implementation with TTL
const cache = new Map<string, { data: SearchFeedItem[]; timestamp: number; ttl: number }>();
const CACHE_TTL = 60000; // 1 minute

const getCacheKey = (props: UseOptimizedSearchFeedRpcProps): string => {
  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes,
    selectedDietCategories,
    minRating,
    isOpenNow = false,
    maxResults = 50
  } = props;

  // Create geohash-like key for better cache hit rate
  const latRounded = userLat ? Math.round(userLat * 100) / 100 : null;
  const lngRounded = userLng ? Math.round(userLng * 100) / 100 : null;
  
  return JSON.stringify({
    q: searchQuery.trim(),
    lat: latRounded,
    lng: lngRounded,
    maxKm: maxDistance,
    cuisines: cuisineTypeIds?.sort(),
    prices: priceRanges?.sort(),
    estTypes: selectedEstablishmentTypes?.sort(),
    diet: selectedDietCategories?.sort(),
    minRating,
    isOpenNow,
    maxResults
  });
};

export const useOptimizedSearchFeedRpc = (props: UseOptimizedSearchFeedRpcProps) => {
  const [restaurants, setRestaurants] = useState<SearchFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverTiming, setServerTiming] = useState<number | null>(null);

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes,
    selectedDietCategories,
    minRating,
    isOpenNow = false,
    maxResults = 50
  } = props;

  // Memoize cache key to prevent unnecessary recalculations
  const cacheKey = useMemo(() => getCacheKey(props), [
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    cuisineTypeIds,
    priceRanges,
    selectedEstablishmentTypes,
    selectedDietCategories,
    minRating,
    isOpenNow,
    maxResults
  ]);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        console.log('🎯 Cache HIT for search_feed:', cacheKey.substring(0, 50) + '...');
        setRestaurants(cached.data);
        setServerTiming(0); // Cache hit
        setLoading(false);
        return;
      }

      const startTime = performance.now();

      console.log('🚀 Calling optimized search_feed RPC', {
        searchQuery,
        userLat,
        userLng,
        maxDistance,
        cuisineTypeIds,
        priceRanges,
        selectedEstablishmentTypes,
        selectedDietCategories,
        minRating,
        isOpenNow,
        maxResults
      });

      const { data, error } = await supabase.rpc('search_feed', {
        p_q: searchQuery.trim(),
        p_lat: userLat || null,
        p_lon: userLng || null,
        p_max_km: maxDistance,
        p_cuisines: cuisineTypeIds && cuisineTypeIds.length > 0 ? cuisineTypeIds : null,
        p_price_bands: priceRanges && priceRanges.length > 0 ? priceRanges : null,
        p_est_types: selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : null,
        p_diet: selectedDietCategories && selectedDietCategories.length > 0 ? selectedDietCategories.join(',') : null,
        p_min_rating: minRating || null,
        p_limit: maxResults
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      setServerTiming(duration);

      // Performance logging with detailed metrics
      try {
        await supabase.from('analytics_events').insert({
          event_type: 'performance',
          event_name: 'optimized_search_feed_rpc',
          properties: {
            duration_ms: duration,
            cache_status: 'miss',
            results_count: data?.length || 0,
            has_location: !!(userLat && userLng),
            has_filters: !!(cuisineTypeIds?.length || priceRanges?.length || selectedEstablishmentTypes?.length),
            timestamp: Date.now()
          }
        });
      } catch (logError) {
        console.warn('Failed to log performance:', logError);
      }

      if (error) {
        console.error('useOptimizedSearchFeedRpc: RPC error:', error);
        throw error;
      }

      if (data && Array.isArray(data)) {
        const formattedData: SearchFeedItem[] = data.map((item: any) => {
          // Optimized JSON parsing with error handling
          let cuisine_types: Array<{ id: number; name: string; slug: string }> = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(item.cuisine_types) 
              ? item.cuisine_types 
              : JSON.parse(item.cuisine_types || '[]');
          } catch (e) {
            console.warn('Failed to parse cuisine_types for item:', item.id);
            cuisine_types = [];
          }

          try {
            services = Array.isArray(item.services) 
              ? item.services 
              : JSON.parse(item.services || '[]');
          } catch (e) {
            console.warn('Failed to parse services for item:', item.id);
            services = [];
          }

          return {
            id: item.id,
            name: item.name,
            slug: item.slug,
            distance_km: item.distance_km ? Number(item.distance_km) : undefined,
            google_rating: item.google_rating,
            google_rating_count: item.google_rating_count,
            price_range: item.price_range,
            cover_image_url: item.cover_image_url,
            logo_url: item.logo_url,
            cuisine_types,
            establishment_type: item.establishment_type,
            services,
            favorites_count: item.favorites_count || 0,
            vegan_pct: Number(item.vegan_pct || 0),
            vegetarian_pct: Number(item.vegetarian_pct || 0),
            glutenfree_pct: Number(item.glutenfree_pct || 0),
            healthy_pct: Number(item.healthy_pct || 0),
            items_total: Number(item.items_total || 0)
          };
        });

        // Cache the results
        cache.set(cacheKey, {
          data: formattedData,
          timestamp: Date.now(),
          ttl: CACHE_TTL
        });

        // Clean old cache entries (simple LRU-like behavior)
        if (cache.size > 100) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey) cache.delete(oldestKey);
        }

        console.log(`🎯 Found ${formattedData.length} restaurants in ${duration.toFixed(3)}ms`);
        setRestaurants(formattedData);
      } else {
        setRestaurants([]);
      }

    } catch (err) {
      console.error('useOptimizedSearchFeedRpc: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, searchQuery, userLat, userLng, maxDistance, cuisineTypeIds, priceRanges, selectedEstablishmentTypes, selectedDietCategories, minRating, isOpenNow, maxResults]);

  useEffect(() => {
    // Intelligent debouncing - shorter for cached results, longer for new searches
    const cached = cache.get(cacheKey);
    const debounceMs = cached ? 50 : (searchQuery ? 300 : 100);
    
    const debounceTimer = setTimeout(fetchRestaurants, debounceMs);
    return () => clearTimeout(debounceTimer);
  }, [fetchRestaurants, cacheKey, searchQuery]);

  // Optimized real-time updates with event delegation
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useOptimizedSearchFeedRpc: Received favoriteToggled event:', { restaurantId, newCount });
      
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    // Real-time subscription optimized for visible restaurants only
    const visibleRestaurantIds = restaurants.map(r => r.id);
    const channel = supabase
      .channel('restaurants-favorites-optimized')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'restaurants',
          filter: `id=in.(${visibleRestaurantIds.join(',')})`
        },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useOptimizedSearchFeedRpc: DB update:', { restaurantId, newFavoritesCount });
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
  }, [restaurants]);

  return { 
    restaurants, 
    loading, 
    error, 
    refetch: fetchRestaurants, 
    serverTiming,
    cacheHit: serverTiming === 0
  };
};
