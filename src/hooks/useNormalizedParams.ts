
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  normalizeFeedParams, 
  generateCanonicalParams, 
  parseUrlParams,
  type NormalizedFeedParams 
} from '@/utils/paramNormalizer';

interface UseNormalizedParamsProps {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated?: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  isOpenNow?: boolean;
}

export function useNormalizedParams(params: UseNormalizedParamsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse current URL parameters
  const urlParams = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  // Get normalized parameters
  const normalizedParams = useMemo(() => {
    return normalizeFeedParams(params);
  }, [
    params.searchQuery,
    params.userLat,
    params.userLng,
    params.maxDistance,
    JSON.stringify(params.cuisineTypeIds),
    JSON.stringify(params.priceRanges),
    params.isHighRated,
    JSON.stringify(params.selectedEstablishmentTypes),
    JSON.stringify(params.selectedDietCategories),
    params.isOpenNow
  ]);

  // Generate canonical URL
  const canonicalUrl = useMemo(() => {
    const canonicalParams = generateCanonicalParams(normalizedParams);
    const baseUrl = `${window.location.origin}${location.pathname}`;
    
    if (canonicalParams.toString()) {
      return `${baseUrl}?${canonicalParams.toString()}`;
    }
    return baseUrl;
  }, [normalizedParams, location.pathname]);

  // Update URL with canonical parameters
  const updateUrl = useCallback((replace: boolean = false) => {
    const canonicalParams = generateCanonicalParams(normalizedParams);
    const newSearch = canonicalParams.toString();
    
    // Only update if different from current
    if (newSearch !== location.search.substring(1)) {
      const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      
      if (replace) {
        navigate(newPath, { replace: true });
      } else {
        navigate(newPath);
      }
    }
  }, [normalizedParams, location.pathname, location.search, navigate]);

  // Initialize URL from current parameters on mount
  useEffect(() => {
    // Only update URL if we have meaningful parameters and current URL is different
    const hasFilters = normalizedParams.searchQuery || 
                      normalizedParams.cuisineTypeIds?.length ||
                      normalizedParams.priceRanges?.length ||
                      normalizedParams.selectedEstablishmentTypes?.length ||
                      normalizedParams.selectedDietCategories?.length ||
                      normalizedParams.isHighRated ||
                      normalizedParams.isOpenNow ||
                      normalizedParams.geohash;

    if (hasFilters) {
      updateUrl(true); // Use replace to avoid adding to history
    }
  }, []); // Only run on mount

  return {
    normalizedParams,
    canonicalUrl,
    updateUrl,
    urlParams
  };
}
