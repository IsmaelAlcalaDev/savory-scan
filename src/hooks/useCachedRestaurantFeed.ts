
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CacheMetrics {
  hitRate: number;
  avgLatency: number;
  cacheStatus: string;
  geohash?: string;
  requests: number;
  hits: number;
  misses: number;
}

interface UseCachedRestaurantFeedParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  sortBy?: 'distance' | 'rating' | 'favorites';
}

export function useCachedRestaurantFeed(params: UseCachedRestaurantFeedParams) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
    hitRate: 0,
    avgLatency: 0,
    cacheStatus: 'unknown',
    requests: 0,
    hits: 0,
    misses: 0
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!params.userLat || !params.userLng) {
        setRestaurants([]);
        return;
      }

      setLoading(true);
      setError(null);
      const startTime = performance.now();

      try {
        // Build query parameters for the cached edge function
        const queryParams = new URLSearchParams();
        
        if (params.searchQuery) queryParams.set('searchQuery', params.searchQuery);
        if (params.userLat) queryParams.set('userLat', params.userLat.toString());
        if (params.userLng) queryParams.set('userLng', params.userLng.toString());
        if (params.maxDistance) queryParams.set('maxDistance', params.maxDistance.toString());
        if (params.cuisineTypeIds?.length) queryParams.set('cuisineTypeIds', JSON.stringify(params.cuisineTypeIds));
        if (params.priceRanges?.length) queryParams.set('priceRanges', JSON.stringify(params.priceRanges));
        if (params.selectedEstablishmentTypes?.length) queryParams.set('selectedEstablishmentTypes', JSON.stringify(params.selectedEstablishmentTypes));
        if (params.selectedDietCategories?.length) queryParams.set('selectedDietCategories', JSON.stringify(params.selectedDietCategories));
        if (params.isHighRated) queryParams.set('isHighRated', 'true');
        if (params.sortBy) queryParams.set('sortBy', params.sortBy);

        const { data, error: functionError } = await supabase.functions.invoke('cached-restaurant-feed', {
          method: 'GET'
        });

        const endTime = performance.now();
        const latency = endTime - startTime;

        if (functionError) {
          throw new Error(functionError.message);
        }

        // Extract cache metrics from response headers (if available)
        // Note: In a real implementation, you'd get these from the response
        const mockCacheStatus = Math.random() > 0.5 ? 'redis-hit' : 'db-fallback';
        
        setCacheMetrics(prev => ({
          ...prev,
          avgLatency: latency,
          cacheStatus: mockCacheStatus,
          requests: prev.requests + 1,
          hits: mockCacheStatus === 'redis-hit' ? prev.hits + 1 : prev.hits,
          misses: mockCacheStatus === 'db-fallback' ? prev.misses + 1 : prev.misses,
          hitRate: prev.requests > 0 ? (prev.hits / prev.requests) * 100 : 0
        }));

        setRestaurants(data || []);
      } catch (err) {
        console.error('Error fetching cached restaurants:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        
        setCacheMetrics(prev => ({
          ...prev,
          requests: prev.requests + 1,
          misses: prev.misses + 1,
          cacheStatus: 'error'
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [
    params.searchQuery,
    params.userLat,
    params.userLng,
    params.maxDistance,
    JSON.stringify(params.cuisineTypeIds),
    JSON.stringify(params.priceRanges),
    JSON.stringify(params.selectedEstablishmentTypes),
    JSON.stringify(params.selectedDietCategories),
    params.isHighRated,
    params.sortBy
  ]);

  return {
    restaurants,
    loading,
    error,
    cacheMetrics
  };
}
