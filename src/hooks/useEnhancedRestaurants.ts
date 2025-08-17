
import { useOptimizedRestaurants } from './useOptimizedRestaurants';
import { useEnhancedIntelligentRestaurants } from './useEnhancedIntelligentRestaurants';

interface UseEnhancedRestaurantsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
}

export const useEnhancedRestaurants = (props: UseEnhancedRestaurantsProps) => {
  // Always use the optimized restaurants hook now
  // The optimized version handles both search and non-search cases efficiently
  return useOptimizedRestaurants(props);
};
