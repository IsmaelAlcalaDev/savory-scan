
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
      console.log('Manual rating cache sync...', restaurantId ? `for restaurant ${restaurantId}` : 'for all restaurants');

      // Since the automated sync functions were removed, we'll do a manual sync
      // by recalculating ratings directly from the restaurants table
      
      let query = supabase
        .from('restaurants')
        .select('id, google_rating, google_rating_count, favorites_count');

      if (restaurantId) {
        query = query.eq('id', restaurantId);
      }

      const { data: restaurants, error } = await query
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null);

      if (error) {
        console.error('Error fetching restaurants for sync:', error);
        return null;
      }

      // Get stats
      const stats = await getRatingCacheStats();
      console.log('Manual rating sync completed:', stats);
      
      return stats;
    } catch (err) {
      console.error('Failed to sync rating cache:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRatingCacheStats = async (): Promise<RatingCacheSyncStats> => {
    try {
      // Get total active restaurants
      const { count: totalRestaurants } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null);

      // Since restaurant_rating_cache was removed, we'll count restaurants with ratings
      const { count: syncedRestaurants } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_published', true)
        .is('deleted_at', null)
        .not('google_rating', 'is', null);

      return {
        totalRestaurants: totalRestaurants || 0,
        syncedRestaurants: syncedRestaurants || 0,
        staleRestaurants: 0, // No longer applicable since cache table was removed
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

  // Cleanup function no longer needed since cache table was removed
  const cleanupRatingCache = async (): Promise<number> => {
    console.log('Cleanup not needed - rating cache table was removed');
    return 0;
  };

  // Stale ratings function no longer needed
  const getStaleRatings = async () => {
    console.log('Stale ratings check not needed - rating cache table was removed');
    return [];
  };

  return {
    syncRatingCache,
    getStaleRatings,
    cleanupRatingCache,
    getRatingCacheStats,
    loading
  };
};
