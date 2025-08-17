
import { useOptimizedHomeRealtime } from './useOptimizedHomeRealtime';
import { useOptimizedRestaurantsRealtime } from './useOptimizedRestaurantsRealtime';

interface UseOptimizedRealtimeProps {
  screen: 'home' | 'restaurants' | 'dishes' | 'favorites';
}

export const useOptimizedRealtime = ({ screen }: UseOptimizedRealtimeProps) => {
  switch (screen) {
    case 'home':
      return useOptimizedHomeRealtime();
    case 'restaurants':
      return useOptimizedRestaurantsRealtime();
    default:
      // For now, return home realtime as fallback
      return useOptimizedHomeRealtime();
  }
};

// Export individual hooks for direct usage
export { useOptimizedHomeRealtime } from './useOptimizedHomeRealtime';
export { useOptimizedRestaurantsRealtime } from './useOptimizedRestaurantsRealtime';
