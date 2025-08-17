
import { useEnhancedRestaurants } from './useEnhancedRestaurants';
import { useCuisineTypes } from './useCuisineTypes';
import { useFeatureFlags } from './useFeatureFlags';

interface UseOptimizedHomeDataProps {
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
  limit?: number;
}

export const useOptimizedHomeData = (props: UseOptimizedHomeDataProps) => {
  const { flags } = useFeatureFlags();
  
  // Use enhanced restaurants hook for home data
  const restaurantsData = useEnhancedRestaurants({
    ...props,
    limit: props.limit || 20, // Default limit for home page
  });

  // Get cuisine types for filters
  const { cuisineTypes, loading: cuisineTypesLoading } = useCuisineTypes();

  return {
    restaurants: restaurantsData.restaurants,
    loading: restaurantsData.loading || cuisineTypesLoading,
    error: restaurantsData.error,
    cuisineTypes,
    flags,
  };
};
