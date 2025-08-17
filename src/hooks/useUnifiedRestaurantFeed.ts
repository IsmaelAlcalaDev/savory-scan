
import { useRestaurantFeed } from './useRestaurantFeed';
import { usePaginatedRestaurants } from './usePaginatedRestaurants';
import { useRestaurantFeedRpc } from './useFeatureFlags';

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
  const { enabled: useRpcFeed, loading: flagLoading } = useRestaurantFeedRpc();
  
  // Use new RPC system when flag is enabled
  const rpcFeedResult = useRestaurantFeed({
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

  // Use old pagination system when flag is disabled
  const paginatedResult = usePaginatedRestaurants({
    searchQuery: props.searchQuery,
    userLat: props.userLat,
    userLng: props.userLng,
    maxDistance: props.maxDistance,
    cuisineTypeIds: props.cuisineTypeIds,
    priceRanges: props.priceRanges,
    isHighRated: props.isHighRated,
    selectedEstablishmentTypes: props.selectedEstablishmentTypes,
    selectedDietTypes: props.selectedDietTypes,
    sortBy: props.sortBy,
  });

  console.log(`useUnifiedRestaurantFeed: Using ${useRpcFeed ? 'RPC' : 'Paginated'} system`);

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

  if (useRpcFeed) {
    // Return RPC system results
    return {
      restaurants: rpcFeedResult.restaurants.map(normalizeRestaurantData),
      loading: rpcFeedResult.loading,
      error: rpcFeedResult.error,
      hasMore: false, // RPC system doesn't use pagination
      loadMore: () => {}, // No-op for RPC system
      refetch: rpcFeedResult.refetch,
      serverTiming: rpcFeedResult.serverTiming,
      systemType: 'rpc' as const
    };
  } else {
    // Return paginated system results
    return {
      restaurants: paginatedResult.restaurants.map(normalizeRestaurantData),
      loading: paginatedResult.loading,
      error: paginatedResult.error,
      hasMore: paginatedResult.hasMore,
      loadMore: paginatedResult.loadMore,
      refetch: paginatedResult.refresh,
      serverTiming: paginatedResult.serverTiming,
      systemType: 'paginated' as const
    };
  }
};
