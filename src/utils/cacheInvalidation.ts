
import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/cacheService';

interface InvalidationOptions {
  restaurantId?: number;
  geohash?: string;
  cityId?: number;
  global?: boolean;
}

export class CacheInvalidationManager {
  private static instance: CacheInvalidationManager;

  private constructor() {}

  static getInstance(): CacheInvalidationManager {
    if (!CacheInvalidationManager.instance) {
      CacheInvalidationManager.instance = new CacheInvalidationManager();
    }
    return CacheInvalidationManager.instance;
  }

  /**
   * Invalidate cache when restaurant data changes
   */
  async invalidateRestaurantCache(options: InvalidationOptions = {}): Promise<void> {
    try {
      console.log('Invalidating restaurant cache:', options);

      // Call edge function to handle cache invalidation
      const { data, error } = await supabase.functions.invoke('invalidate-cache', {
        body: options
      });

      if (error) {
        console.error('Cache invalidation failed:', error);
        throw error;
      }

      console.log('Cache invalidated successfully:', data);
    } catch (error) {
      console.error('Error during cache invalidation:', error);
      // Don't throw - cache invalidation shouldn't break the app
    }
  }

  /**
   * Invalidate cache for specific restaurant area
   */
  async invalidateAreaCache(lat: number, lon: number, radiusKm: number = 5): Promise<void> {
    const geohash = cacheService.generateGeohash(lat, lon, 7);
    await this.invalidateRestaurantCache({ geohash });
  }

  /**
   * Invalidate cache when restaurant opens/closes
   */
  async invalidateRestaurantStatus(restaurantId: number, lat?: number, lon?: number): Promise<void> {
    const options: InvalidationOptions = { restaurantId };
    
    if (lat && lon) {
      options.geohash = cacheService.generateGeohash(lat, lon, 7);
    }

    await this.invalidateRestaurantCache(options);
  }

  /**
   * Global cache invalidation (use sparingly)
   */
  async invalidateGlobalCache(): Promise<void> {
    await this.invalidateRestaurantCache({ global: true });
  }
}

export const cacheInvalidationManager = CacheInvalidationManager.getInstance();

// Setup automatic invalidation listeners
export const setupCacheInvalidationListeners = () => {
  // Listen for restaurant updates that should trigger cache invalidation
  const channel = supabase
    .channel('cache-invalidation')
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'restaurants',
        filter: 'is_active=eq.true'
      },
      (payload) => {
        const restaurant = payload.new as any;
        console.log('Restaurant updated, invalidating cache:', restaurant.id);
        
        // Invalidate cache for this restaurant's area
        if (restaurant.latitude && restaurant.longitude) {
          cacheInvalidationManager.invalidateAreaCache(
            restaurant.latitude, 
            restaurant.longitude
          );
        }
      }
    )
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'restaurants' 
      },
      (payload) => {
        const restaurant = payload.new as any;
        console.log('New restaurant added, invalidating cache:', restaurant.id);
        
        // Invalidate cache for this restaurant's area
        if (restaurant.latitude && restaurant.longitude) {
          cacheInvalidationManager.invalidateAreaCache(
            restaurant.latitude, 
            restaurant.longitude
          );
        }
      }
    )
    .subscribe();

  return channel;
};
