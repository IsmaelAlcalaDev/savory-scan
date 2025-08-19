
import { useCallback } from 'react';
import { useOptimizedMetrics } from './useOptimizedMetrics';

export const useSimplifiedProfileTracking = () => {
  const { trackMetric } = useOptimizedMetrics();

  const trackProfileView = useCallback(async (restaurantId: number) => {
    try {
      // Use the new unified metrics system instead of the old track_profile_view function
      await trackMetric('restaurant', restaurantId, 'profile_view', 1, {
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });

      console.log(`Profile view tracked for restaurant ${restaurantId}`);
    } catch (error) {
      console.warn('Failed to track profile view:', error);
      // Non-blocking - don't throw to avoid breaking user experience
    }
  }, [trackMetric]);

  const trackMenuView = useCallback(async (restaurantId: number) => {
    try {
      await trackMetric('restaurant', restaurantId, 'menu_view', 1, {
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });

      console.log(`Menu view tracked for restaurant ${restaurantId}`);
    } catch (error) {
      console.warn('Failed to track menu view:', error);
    }
  }, [trackMetric]);

  const trackDishView = useCallback(async (dishId: number, restaurantId: number) => {
    try {
      await trackMetric('dish', dishId, 'view', 1, {
        restaurant_id: restaurantId,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      });

      console.log(`Dish view tracked for dish ${dishId}`);
    } catch (error) {
      console.warn('Failed to track dish view:', error);
    }
  }, [trackMetric]);

  return {
    trackProfileView,
    trackMenuView,
    trackDishView
  };
};
