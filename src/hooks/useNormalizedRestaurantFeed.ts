
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  normalizeFeedParams, 
  generateCacheKey,
  type NormalizedFeedParams 
} from '@/utils/paramNormalizer';

interface RestaurantFeedItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  distance_km?: number;
  google_rating?: number;
  google_rating_count?: number;
  price_range: string;
  cover_image_url?: string;
  logo_url?: string;
  cuisine_types: Array<{ name: string; slug: string }>;
  establishment_type?: string;
  services: string[];
  favorites_count: number;
  vegan_pct: number;
  vegetarian_pct: number;
  glutenfree_pct: number;
  healthy_pct: number;
  items_total: number;
}

interface UseNormalizedRestaurantFeedProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  isOpenNow?: boolean;
  sortBy?: 'distance' | 'rating' | 'favorites';
}

export const useNormalizedRestaurantFeed = (props: UseNormalizedRestaurantFeedProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize parameters
  const normalizedParams = normalizeFeedParams(props);
  const cacheKey = generateCacheKey(normalizedParams);

  console.log('useNormalizedRestaurantFeed: Generated cache key:', cacheKey);
  console.log('useNormalizedRestaurantFeed: Normalized params:', normalizedParams);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('useNormalizedRestaurantFeed: Fetching with normalized parameters', {
        cacheKey,
        normalizedParams
      });

      // Prepare parameters for RPC call using normalized values
      const rpcParams = {
        search_query: normalizedParams.searchQuery || '',
        user_lat: normalizedParams.userLat || null,
        user_lon: normalizedParams.userLng || null,
        max_distance_km: normalizedParams.maxDistance,
        cuisine_type_ids: normalizedParams.cuisineTypeIds || null,
        price_ranges: normalizedParams.priceRanges || null,
        establishment_type_ids: normalizedParams.selectedEstablishmentTypes || null,
        diet_categories: normalizedParams.selectedDietCategories || null,
        min_rating: normalizedParams.isHighRated ? 4.5 : null,
        is_open_now: normalizedParams.isOpenNow,
        max_results: 50
      };

      // Use the generic rpc method since the function isn't in types yet
      const { data, error } = await supabase.rpc('search_restaurant_feed' as any, rpcParams);

      if (error) {
        console.error('useNormalizedRestaurantFeed: RPC error:', error);
        throw error;
      }

      if (data && Array.isArray(data)) {
        const formattedData: RestaurantFeedItem[] = data.map((item: any) => {
          // Parse JSON fields safely
          let cuisine_types: Array<{ name: string; slug: string }> = [];
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
            description: item.description,
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

        console.log('useNormalizedRestaurantFeed: Formatted results:', formattedData.length, 'restaurants');
        setRestaurants(formattedData);
      } else {
        setRestaurants([]);
      }

    } catch (err) {
      console.error('useNormalizedRestaurantFeed: Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey]); // Use cacheKey as dependency to ensure stable memoization

  useEffect(() => {
    // Debounce search queries for better performance
    const debounceTimer = setTimeout(fetchRestaurants, normalizedParams.searchQuery ? 250 : 100);
    return () => clearTimeout(debounceTimer);
  }, [fetchRestaurants]);

  // Handle favorites updates via event system
  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      console.log('useNormalizedRestaurantFeed: Received favoriteToggled event:', { restaurantId, newCount });
      
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
      .channel('restaurants-favorites-normalized-feed')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useNormalizedRestaurantFeed: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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

  return { 
    restaurants, 
    loading, 
    error, 
    refetch: fetchRestaurants,
    cacheKey,
    normalizedParams
  };
};
