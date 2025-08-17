
import { useFeatureFlags } from './useFeatureFlags';
import { useRpcFeed } from './useRpcFeed';
import { useOptimizedRestaurants } from './useOptimizedRestaurants';

interface UseEnhancedRpcFeedProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  minDietPercentages?: Record<string, number>;
  isOpenNow?: boolean;
}

export const useEnhancedRpcFeed = (props: UseEnhancedRpcFeedProps) => {
  const { flags } = useFeatureFlags();
  
  // Usar RPC feed si está habilitado el feature flag
  const rpcResults = useRpcFeed({
    ...props,
  });

  // Hook tradicional como fallback
  const traditionalResults = useOptimizedRestaurants({
    ...props,
  });

  // Determinar qué resultados usar basado en feature flag
  const shouldUseRpcFeed = flags?.FF_HOME_RPC_FEED;

  if (shouldUseRpcFeed) {
    console.log('useEnhancedRpcFeed: Using RPC feed (feature flag enabled)');
    return rpcResults;
  }

  console.log('useEnhancedRpcFeed: Using traditional feed (RPC disabled)');
  return traditionalResults;
};
