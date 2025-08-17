
import { useOptimizedRestaurants } from './useOptimizedRestaurants';
import { useSpatialRestaurants } from './useSpatialRestaurants';

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
  const hasLocation = Boolean(props.userLat && props.userLng);
  
  // Usar consultas espaciales cuando tenemos ubicación del usuario
  const spatialResults = useSpatialRestaurants({
    ...props,
    enabled: hasLocation
  });

  // Usar consultas tradicionales cuando no tenemos ubicación
  const traditionalResults = useOptimizedRestaurants({
    ...props,
    // Solo habilitar cuando no tenemos ubicación
    // Si tenemos ubicación pero no hay resultados espaciales, usar como fallback
  });

  // Determinar qué resultados usar
  if (hasLocation) {
    // Si tenemos ubicación, usar resultados espaciales
    if (spatialResults.loading || spatialResults.restaurants.length > 0 || spatialResults.error) {
      return spatialResults;
    }
    // Fallback a resultados tradicionales si no hay resultados espaciales
    console.log('useEnhancedRestaurants: Falling back to traditional results');
  }

  // Sin ubicación o como fallback, usar resultados tradicionales
  return traditionalResults;
};
