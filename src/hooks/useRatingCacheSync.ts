
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RatingCacheSyncStats {
  totalRestaurants: number;
  syncedRestaurants: number;
  staleRestaurants: number;
  cleanedRestaurants: number;
}

export const useRatingCacheSync = () => {
  const [loading, setLoading] = useState(false);

  const syncRatingCache = async (restaurantId?: number): Promise<RatingCacheSyncStats | null> => {
    try {
      setLoading(true);
      console.log('Syncing rating cache...', restaurantId ? `for restaurant ${restaurantId}` : 'for all restaurants');

      // Call the sync function
      const { error } = await supabase.rpc('sync_restaurant_rating_cache', {
        restaurant_id_param: restaurantId || null
      });

      if (error) {
        console.error('Error syncing rating cache:', error);
        return null;
      }

      // Get stats after sync
      const stats = await getRatingCacheStats();
      console.log('Rating cache sync completed:', stats);
      
      return stats;
    } catch (err) {
      console.error('Failed to sync rating cache:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getStaleRatings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_stale_rating_cache');
      
      if (error) {
        console.error('Error fetching stale ratings:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Failed to get stale ratings:', err);
      return [];
    }
  };

  const cleanupRatingCache = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('cleanup_rating_cache');
      
      if (error) {
        console.error('Error cleaning up rating cache:', error);
        return 0;
      }

      console.log('Cleaned up', data, 'stale rating cache entries');
      return data || 0;
    } catch (err) {
      console.error('Failed to cleanup rating cache:', err);
      return 0;
    }
  };

  const getRatingCacheStats = async (): Promise<RatingCacheSyncStats> => {
    try {
      // Get total active restaurants
      const { count: totalRestaurants } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_published', true);

      // Get cached restaurants
      const { count: syncedRestaurants } = await supabase
        .from('restaurant_rating_cache')
        .select('*', { count: 'exact', head: true });

      // Get stale entries
      const staleData = await getStaleRatings();
      
      return {
        totalRestaurants: totalRestaurants || 0,
        syncedRestaurants: syncedRestaurants || 0,
        staleRestaurants: staleData.length,
        cleanedRestaurants: 0
      };
    } catch (err) {
      console.error('Failed to get rating cache stats:', err);
      return {
        totalRestaurants: 0,
        syncedRestaurants: 0,
        staleRestaurants: 0,
        cleanedRestaurants: 0
      };
    }
  };

  return {
    syncRatingCache,
    getStaleRatings,
    cleanupRatingCache,
    getRatingCacheStats,
    loading
  };
};
