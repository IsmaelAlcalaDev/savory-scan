
import { useState, useEffect, useCallback } from 'react';
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

interface UseSearchFeedRpcProps {
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

export const useSearchFeedRpc = (props: UseSearchFeedRpcProps) => {
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
    maxResults = 50
  } = props;

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setServerTiming(null);

      const startTime = performance.now();

      console.log('useSearchFeedRpc: Calling optimized search_restaurant_feed RPC', {
        searchQuery,
        userLat,
        userLng,
        maxDistance,
        cuisineTypeIds,
        priceRanges,
        selectedEstablishmentTypes,
        selectedDietCategories,
        minRating,
        maxResults
      });

      // Format diet categories for the new RPC function
      const dietString = selectedDietCategories && selectedDietCategories.length > 0 
        ? selectedDietCategories.join(',') 
        : null;

      // Use .rpc() with proper type casting
      const { data, error } = await supabase.rpc('search_restaurant_feed' as any, {
        p_q: searchQuery.trim(),
        p_lat: userLat || null,
        p_lon: userLng || null,
        p_max_km: maxDistance,
        p_cuisines: cuisineTypeIds && cuisineTypeIds.length > 0 ? cuisineTypeIds : null,
        p_price_bands: priceRanges && priceRanges.length > 0 ? priceRanges : null,
        p_est_types: selectedEstablishmentTypes && selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : null,
        p_diet: dietString,
        p_min_rating: minRating || null,
        p_limit: maxResults
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      setServerTiming(duration);

      // Log performance using direct insert to avoid RPC type issues
      try {
        await supabase.from('analytics_events').insert({
          event_type: 'performance',
          event_name: 'search_restaurant_feed_rpc',
          properties: {
            duration_ms: duration,
            timestamp: Date.now(),
            results_count: Array.isArray(data) ? data.length : 0,
            has_diet_filter: !!dietString,
            diet_categories: selectedDietCategories || []
          }
        });
      } catch (logError) {
        console.warn('Failed to log performance:', logError);
      }

      if (error) {
        console.error('useSearchFeedRpc: RPC error:', error);
        throw error;
      }

      if (data && Array.isArray(data)) {
        const formattedData: SearchFeedItem[] = data.map((item: any) => {
          // Parse JSON fields safely
          let cuisine_types: Array<{ id: number; name: string; slug: string }> = [];
          let services: string[] = [];

          try {
            cuisine_types = Array.isArray(item.cuisine_types) 
              ? item.cuisine_types 
              : JSON.parse(item.cuisine_types || '[]');
          } catch (e) {
            cuisine_types = [];
          }

          try {
            services = Array.isArray(item.services) 
              ? item.services 
              : JSON.parse(item.services || '[]');
          } catch (e) {
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

        console.log(`useSearchFeedRpc: Found ${formattedData.length} restaurants in ${duration.toFixed(3)}ms`);
        setRestaurants(formattedData);
      } else {
        setRestaurants([]);
      }

    } catch (err) {
      console.error('useSearchFeedRpc: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    userLat,
    userLng,
    maxDistance,
    JSON.stringify(cuisineTypeIds),
    JSON.stringify(priceRanges),
    JSON.stringify(selectedEstablishmentTypes),
    JSON.stringify(selectedDietCategories),
    minRating,
    maxResults
  ]);

  useEffect(() => {
    // Debounce search queries for better performance
    const debounceTimer = setTimeout(fetchRestaurants, searchQuery ? 250 : 100);
    return () => clearTimeout(debounceTimer);
  }, [fetchRestaurants]);

  // Handle favorites updates via event system
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useSearchFeedRpc: Received favoriteToggled event:', { restaurantId, newCount });
      
      setRestaurants(prev =>
        prev.map(r => 
          r.id === restaurantId 
            ? { ...r, favorites_count: Math.max(0, newCount) }
            : r
        )
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);

    // Real-time subscription for favorites count
    const channel = supabase
      .channel('restaurants-favorites-feed-rpc')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useSearchFeedRpc: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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

  return { restaurants, loading, error, refetch: fetchRestaurants, serverTiming };
};
