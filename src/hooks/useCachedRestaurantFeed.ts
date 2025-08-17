import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/cacheService';

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
  is_favorited?: boolean; // Client-side only
}

interface UseCachedRestaurantFeedProps {
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

interface CacheMetrics {
  hitRate: number;
  avgLatency: number;
  cacheStatus: string;
  geohash?: string;
}

export const useCachedRestaurantFeed = (props: UseCachedRestaurantFeedProps) => {
  const [restaurants, setRestaurants] = useState<RestaurantFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    avgLatency: 0,
    cacheStatus: 'unknown'
  });

  const {
    searchQuery = '',
    userLat,
    userLng,
    maxDistance = 50,
    cuisineTypeIds,
    priceRanges,
    isHighRated = false,
    selectedEstablishmentTypes,
    selectedDietCategories,
    isOpenNow = false,
    sortBy = 'favorites'
  } = props;

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('useCachedRestaurantFeed: Fetching with cached endpoint');
      const startTime = performance.now();

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.set('searchQuery', searchQuery);
      if (userLat) params.set('userLat', userLat.toString());
      if (userLng) params.set('userLng', userLng.toString());
      if (maxDistance) params.set('maxDistance', maxDistance.toString());
      if (cuisineTypeIds?.length) params.set('cuisineTypeIds', JSON.stringify(cuisineTypeIds));
      if (priceRanges?.length) params.set('priceRanges', JSON.stringify(priceRanges));
      if (selectedEstablishmentTypes?.length) {
        params.set('selectedEstablishmentTypes', JSON.stringify(selectedEstablishmentTypes));
      }
      if (selectedDietCategories?.length) {
        params.set('selectedDietCategories', JSON.stringify(selectedDietCategories));
      }
      if (isHighRated) params.set('isHighRated', 'true');
      if (isOpenNow) params.set('isOpenNow', 'true');

      // Call cached edge function
      const { data, error } = await supabase.functions.invoke('cached-restaurant-feed', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('useCachedRestaurantFeed: Edge function error:', error);
        throw error;
      }

      const endTime = performance.now();
      const latency = endTime - startTime;

      // Extract cache metrics from response headers if available
      const cacheStatus = 'unknown'; // Would extract from response headers in real implementation
      
      setCacheMetrics(prev => ({
        ...prev,
        avgLatency: latency,
        cacheStatus
      }));

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

        console.log('useCachedRestaurantFeed: Processed results:', formattedData.length, 'restaurants');
        setRestaurants(formattedData);
      } else {
        setRestaurants([]);
      }

    } catch (err) {
      console.error('useCachedRestaurantFeed: Error:', err);
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
    isHighRated,
    JSON.stringify(selectedEstablishmentTypes),
    JSON.stringify(selectedDietCategories),
    isOpenNow,
    sortBy
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
      console.log('useCachedRestaurantFeed: Received favoriteToggled event:', { restaurantId, newCount });
      
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
      .channel('restaurants-favorites-feed-cached')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'restaurants' },
        (payload) => {
          const updatedRestaurant = payload.new as any;
          const restaurantId = updatedRestaurant?.id;
          const newFavoritesCount = updatedRestaurant?.favorites_count;
          
          if (typeof restaurantId === 'number' && typeof newFavoritesCount === 'number') {
            console.log('useCachedRestaurantFeed: Received favorites_count update from DB:', { restaurantId, newFavoritesCount });
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
    cacheMetrics 
  };
};
