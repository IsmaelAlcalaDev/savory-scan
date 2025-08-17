
import { supabase } from '@/integrations/supabase/client';

interface CacheConfig {
  ttl: number;
  prefix: string;
}

export class CacheService {
  private static instance: CacheService;
  private config: CacheConfig;

  private constructor() {
    this.config = {
      ttl: 60, // 60 seconds default TTL
      prefix: 'feed:v2'
    };
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate geohash from coordinates (simplified version)
   */
  generateGeohash(lat: number, lon: number, precision: number = 7): string {
    // Simplified geohash implementation for demo
    // In production, use a proper geohash library
    const latBin = Math.floor((lat + 90) * Math.pow(2, precision / 2));
    const lonBin = Math.floor((lon + 180) * Math.pow(2, precision / 2));
    return `${latBin.toString(36)}_${lonBin.toString(36)}`;
  }

  /**
   * Generate normalized cache key
   */
  generateCacheKey(params: {
    geohash: string;
    searchQuery?: string;
    cuisineTypeIds?: number[];
    priceRanges?: string[];
    selectedEstablishmentTypes?: number[];
    selectedDietCategories?: string[];
    isHighRated?: boolean;
    isOpenNow?: boolean;
    maxDistance?: number;
  }): string {
    const {
      geohash,
      searchQuery = '',
      cuisineTypeIds = [],
      priceRanges = [],
      selectedEstablishmentTypes = [],
      selectedDietCategories = [],
      isHighRated = false,
      isOpenNow = false,
      maxDistance = 50
    } = params;

    // Normalize and sort arrays for consistent keys
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const sortedCuisines = [...cuisineTypeIds].sort().join(',');
    const sortedPrices = [...priceRanges].sort().join(',');
    const sortedEstablishments = [...selectedEstablishmentTypes].sort().join(',');
    const sortedDiets = [...selectedDietCategories].sort().join(',');
    const rating = isHighRated ? '4.5+' : '';
    const openNow = isOpenNow ? 'open' : '';
    const distance = Math.round(maxDistance);

    return `${this.config.prefix}:${geohash}:${normalizedQuery}:${sortedCuisines}:${sortedPrices}:${sortedEstablishments}:${sortedDiets}:${rating}:${openNow}:${distance}km`;
  }

  /**
   * Check if request is cacheable (doesn't depend on user-specific data)
   */
  isCacheable(params: any): boolean {
    // Cacheable if it doesn't require user-specific data
    return !params.includeUserFavorites && !params.userSpecificData;
  }

  /**
   * Generate cache control headers
   */
  getCacheHeaders(cacheable: boolean): Record<string, string> {
    if (cacheable) {
      return {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Vary': 'Accept-Encoding'
      };
    }
    return {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Expires': '0'
    };
  }

  /**
   * Generate invalidation pattern for area
   */
  getInvalidationPattern(geohash: string): string {
    return `${this.config.prefix}:${geohash}:*`;
  }
}

export const cacheService = CacheService.getInstance();
