
import { useRestaurantFeed } from './useRestaurantFeed';
import { useSearchFeedRpc } from './useSearchFeedRpc';
import { useRestaurantsRpcFeed } from './useFeatureFlags';

interface UnifiedRestaurantFeedProps {
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

// Normalize the data structure between both systems
const normalizeRestaurantData = (restaurant: any) => {
  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    description: restaurant.description,
    distance_km: restaurant.distance_km,
    google_rating: restaurant.google_rating,
    google_rating_count: restaurant.google_rating_count,
    price_range: restaurant.price_range,
    cover_image_url: restaurant.cover_image_url,
    logo_url: restaurant.logo_url,
    cuisine_types: restaurant.cuisine_types,
    establishment_type: restaurant.establishment_type,
    services: restaurant.services || [],
    favorites_count: restaurant.favorites_count || 0,
    vegan_pct: restaurant.vegan_pct || 0,
    vegetarian_pct: restaurant.vegetarian_pct || 0,
    glutenfree_pct: restaurant.glutenfree_pct || 0,
    healthy_pct: restaurant.healthy_pct || 0,
    items_total: restaurant.items_total || 0
  };
};

export const useUnifiedRestaurantFeed = (props: UnifiedRestaurantFeedProps) => {
  const { enabled: useNewRpcFeed, loading: flagLoading } = useRestaurantsRpcFeed();
  
  // Use new optimized RPC system when enabled
  const rpcFeedResult = useSearchFeedRpc({
    searchQuery: props.searchQuery,
    userLat: props.userLat,
    userLng: props.userLng,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietCategories: props.selectedDietCategories,
    minRating: props.isHighRated ? 4.5 : undefined,
    isOpenNow: props.isOpenNow,
    maxResults: 50
  });

  // Use legacy system as fallback
  const legacyFeedResult = useRestaurantFeed({
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

  console.log(`useUnifiedRestaurantFeed: Using ${useNewRpcFeed ? 'NEW OPTIMIZED RPC' : 'LEGACY'} system`);

  if (flagLoading) {
    return {
      restaurants: [],
      loading: true,
      error: null,
      hasMore: false,
      loadMore: () => {},
      refetch: () => {},
      serverTiming: null,
      systemType: 'loading' as const
    };
  }

  if (useNewRpcFeed) {
    // Return new RPC system results
    return {
      restaurants: rpcFeedResult.restaurants.map(normalizeRestaurantData),
      loading: rpcFeedResult.loading,
      error: rpcFeedResult.error,
      hasMore: false, // New RPC system doesn't use pagination yet
      loadMore: () => {}, // No-op for new RPC system
      refetch: rpcFeedResult.refetch,
      serverTiming: rpcFeedResult.serverTiming,
      systemType: 'rpc-optimized' as const
    };
  } else {
    // Return legacy system results (existing behavior)
    return {
      restaurants: legacyFeedResult.restaurants.map(normalizeRestaurantData),
      loading: legacyFeedResult.loading,
      error: legacyFeedResult.error,
      hasMore: false, // Legacy system doesn't use pagination
      loadMore: () => {}, // No-op for legacy system
      refetch: legacyFeedResult.refetch,
      serverTiming: legacyFeedResult.serverTiming,
      systemType: 'legacy' as const
    };
  }
};
