
/**
 * Utility for normalizing feed parameters to ensure consistent cache keys and canonical URLs
 */

// Standard distance values for discretization
const STANDARD_DISTANCES = [1, 2, 5, 10, 25, 50, 100];

// Geohash precision for coordinate rounding (7 chars ≈ ~153m precision)
const GEOHASH_PRECISION = 7;

/**
 * Simple geohash implementation for coordinate normalization
 */
function encodeGeohash(lat: number, lng: number, precision: number = GEOHASH_PRECISION): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let hash = '';
  let bit = 0;
  let even = true;

  while (hash.length < precision) {
    if (even) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) {
        bit = (bit << 1) | 1;
        lngRange[0] = mid;
      } else {
        bit = bit << 1;
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        bit = (bit << 1) | 1;
        latRange[0] = mid;
      } else {
        bit = bit << 1;
        latRange[1] = mid;
      }
    }

    even = !even;

    if (hash.length * 5 + Math.floor(Math.log2(bit)) >= hash.length * 5 + 4) {
      hash += BASE32[bit];
      bit = 0;
    }
  }

  return hash;
}

/**
 * Decode geohash back to approximate coordinates
 */
function decodeGeohash(hash: string): { lat: number; lng: number } {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let latRange = [-90, 90];
  let lngRange = [-180, 180];
  let even = true;

  for (let i = 0; i < hash.length; i++) {
    const char = hash[i];
    const idx = BASE32.indexOf(char);
    
    for (let j = 4; j >= 0; j--) {
      const bit = (idx >> j) & 1;
      
      if (even) {
        const mid = (lngRange[0] + lngRange[1]) / 2;
        if (bit) {
          lngRange[0] = mid;
        } else {
          lngRange[1] = mid;
        }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (bit) {
          latRange[0] = mid;
        } else {
          latRange[1] = mid;
        }
      }
      
      even = !even;
    }
  }

  return {
    lat: (latRange[0] + latRange[1]) / 2,
    lng: (lngRange[0] + lngRange[1]) / 2
  };
}

/**
 * Normalize arrays by sorting and deduplicating
 */
export function normalizeArray<T>(arr: T[] | undefined): T[] | undefined {
  if (!arr || arr.length === 0) return undefined;
  
  const unique = Array.from(new Set(arr));
  return unique.sort((a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });
}

/**
 * Normalize search query
 */
export function normalizeQuery(query: string | undefined): string | undefined {
  if (!query) return undefined;
  
  const normalized = query.trim().toLowerCase();
  return normalized || undefined;
}

/**
 * Discretize distance to standard values
 */
export function normalizeDistance(distance: number | undefined): number {
  if (!distance) return 50; // Default distance
  
  // Find closest standard distance
  return STANDARD_DISTANCES.reduce((closest, current) => {
    return Math.abs(current - distance) < Math.abs(closest - distance) ? current : closest;
  });
}

/**
 * Normalize coordinates to geohash tile
 */
export function normalizeCoordinates(lat: number | undefined, lng: number | undefined): {
  lat: number;
  lng: number;
  geohash: string;
} | undefined {
  if (lat === undefined || lng === undefined) return undefined;
  
  const geohash = encodeGeohash(lat, lng, GEOHASH_PRECISION);
  const normalized = decodeGeohash(geohash);
  
  return {
    lat: normalized.lat,
    lng: normalized.lng,
    geohash
  };
}

/**
 * Main interface for normalized parameters
 */
export interface NormalizedFeedParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  geohash?: string;
  maxDistance: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  isHighRated: boolean;
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  isOpenNow: boolean;
}

/**
 * Normalize all feed parameters
 */
export function normalizeFeedParams(params: {
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
}): NormalizedFeedParams {
  const coordinates = normalizeCoordinates(params.userLat, params.userLng);
  
  return {
    searchQuery: normalizeQuery(params.searchQuery),
    userLat: coordinates?.lat,
    userLng: coordinates?.lng,
    geohash: coordinates?.geohash,
    maxDistance: normalizeDistance(params.maxDistance),
    cuisineTypeIds: normalizeArray(params.cuisineTypeIds),
    priceRanges: normalizeArray(params.priceRanges),
    isHighRated: Boolean(params.isHighRated),
    selectedEstablishmentTypes: normalizeArray(params.selectedEstablishmentTypes),
    selectedDietCategories: normalizeArray(params.selectedDietCategories),
    isOpenNow: Boolean(params.isOpenNow)
  };
}

/**
 * Generate cache key from normalized parameters
 */
export function generateCacheKey(params: NormalizedFeedParams): string {
  const keyParts: string[] = ['feed', 'v2'];
  
  // Add geohash or 'global' for location
  keyParts.push(params.geohash || 'global');
  
  // Add search query
  if (params.searchQuery) {
    keyParts.push(`q:${params.searchQuery}`);
  }
  
  // Add cuisines (already sorted)
  if (params.cuisineTypeIds?.length) {
    keyParts.push(`cuisines:${params.cuisineTypeIds.join(',')}`);
  }
  
  // Add price ranges (already sorted)
  if (params.priceRanges?.length) {
    keyParts.push(`prices:${params.priceRanges.join(',')}`);
  }
  
  // Add establishment types (already sorted)
  if (params.selectedEstablishmentTypes?.length) {
    keyParts.push(`types:${params.selectedEstablishmentTypes.join(',')}`);
  }
  
  // Add diet categories (already sorted)
  if (params.selectedDietCategories?.length) {
    keyParts.push(`diet:${params.selectedDietCategories.join(',')}`);
  }
  
  // Add boolean flags
  if (params.isHighRated) {
    keyParts.push('highrated');
  }
  
  if (params.isOpenNow) {
    keyParts.push('open');
  }
  
  // Add distance
  keyParts.push(`km:${params.maxDistance}`);
  
  return keyParts.join(':');
}

/**
 * Generate canonical URL parameters from normalized params
 */
export function generateCanonicalParams(params: NormalizedFeedParams): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  if (params.searchQuery) {
    urlParams.set('q', params.searchQuery);
  }
  
  if (params.cuisineTypeIds?.length) {
    urlParams.set('cuisines', params.cuisineTypeIds.join(','));
  }
  
  if (params.priceRanges?.length) {
    urlParams.set('prices', params.priceRanges.join(','));
  }
  
  if (params.selectedEstablishmentTypes?.length) {
    urlParams.set('types', params.selectedEstablishmentTypes.join(','));
  }
  
  if (params.selectedDietCategories?.length) {
    urlParams.set('diet', params.selectedDietCategories.join(','));
  }
  
  if (params.isHighRated) {
    urlParams.set('rated', '1');
  }
  
  if (params.isOpenNow) {
    urlParams.set('open', '1');
  }
  
  if (params.maxDistance !== 50) { // Only add if not default
    urlParams.set('km', params.maxDistance.toString());
  }
  
  if (params.geohash) {
    urlParams.set('loc', params.geohash);
  }
  
  return urlParams;
}

/**
 * Parse URL parameters back to normalized params
 */
export function parseUrlParams(urlParams: URLSearchParams): Partial<NormalizedFeedParams> {
  const params: Partial<NormalizedFeedParams> = {};
  
  const q = urlParams.get('q');
  if (q) params.searchQuery = normalizeQuery(q);
  
  const cuisines = urlParams.get('cuisines');
  if (cuisines) {
    params.cuisineTypeIds = normalizeArray(cuisines.split(',').map(Number).filter(n => !isNaN(n)));
  }
  
  const prices = urlParams.get('prices');
  if (prices) {
    params.priceRanges = normalizeArray(prices.split(','));
  }
  
  const types = urlParams.get('types');
  if (types) {
    params.selectedEstablishmentTypes = normalizeArray(types.split(',').map(Number).filter(n => !isNaN(n)));
  }
  
  const diet = urlParams.get('diet');
  if (diet) {
    params.selectedDietCategories = normalizeArray(diet.split(','));
  }
  
  params.isHighRated = urlParams.get('rated') === '1';
  params.isOpenNow = urlParams.get('open') === '1';
  
  const km = urlParams.get('km');
  if (km) {
    params.maxDistance = normalizeDistance(parseInt(km));
  }
  
  const loc = urlParams.get('loc');
  if (loc) {
    const coords = decodeGeohash(loc);
    params.userLat = coords.lat;
    params.userLng = coords.lng;
    params.geohash = loc;
  }
  
  return params;
}
