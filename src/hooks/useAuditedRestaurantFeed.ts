
import { useRestaurantsAuditFeature } from './useRestaurantsAuditFeature';
import { useOptimizedRestaurantFeed } from './useOptimizedRestaurantFeed';
import { useUnifiedRestaurantFeed } from './useUnifiedRestaurantFeed';

interface AuditedRestaurantFeedProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  selectedDietCategories?: string[];
  isOpenNow?: boolean;
  sortBy?: 'distance' | 'rating' | 'favorites';
}

export const useAuditedRestaurantFeed = (props: AuditedRestaurantFeedProps) => {
  const { enabled: auditEnabled, loading: auditLoading } = useRestaurantsAuditFeature();
  
  // Use optimized system when audit feature is enabled
  const optimizedResults = useOptimizedRestaurantFeed({
    searchQuery: props.searchQuery,
    userLat: props.userLat,
    userLng: props.userLng,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietCategories: props.selectedDietCategories,
    isOpenNow: props.isOpenNow,
    sortBy: props.sortBy,
  });

  // Use unified system (fallback) when audit feature is disabled
  const unifiedResults = useUnifiedRestaurantFeed({
    searchQuery: props.searchQuery,
    userLat: props.userLat,
    userLng: props.userLng,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietTypes: props.selectedDietTypes,
    selectedDietCategories: props.selectedDietCategories,
    isOpenNow: props.isOpenNow,
    sortBy: props.sortBy,
  });

  console.log(`useAuditedRestaurantFeed: Using ${auditEnabled ? 'OPTIMIZED AUDIT' : 'UNIFIED FALLBACK'} system`);

  if (auditLoading) {
    return {
      restaurants: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: () => {},
      refetch: () => {},
      serverTiming: null,
      systemType: 'loading' as const,
      cacheHit: false
    };
  }

  if (auditEnabled) {
    // Return optimized audit system results
    return {
      restaurants: optimizedResults.restaurants,
      loading: optimizedResults.loading,
      error: optimizedResults.error,
      hasMore: false, // Optimized system doesn't use pagination
      loadMore: () => {}, // No-op for optimized system
      refetch: optimizedResults.refetch,
      serverTiming: optimizedResults.serverTiming,
      systemType: 'audit' as const,
      cacheHit: optimizedResults.cacheHit
    };
  } else {
    // Return unified system results (existing behavior)
    return {
      restaurants: unifiedResults.restaurants,
      loading: unifiedResults.loading,
      error: unifiedResults.error,
      hasMore: unifiedResults.hasMore,
      loadMore: unifiedResults.loadMore,
      refetch: unifiedResults.refetch,
      serverTiming: unifiedResults.serverTiming,
      systemType: unifiedResults.systemType,
      cacheHit: false
    };
  }
};
