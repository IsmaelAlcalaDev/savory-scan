
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeedParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  cuisineTypeIds?: number[];
  priceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  selectedDietCategories?: string[];
  isHighRated?: boolean;
  sortBy?: 'distance' | 'rating' | 'favorites';
}

interface CacheHeaders {
  'x-cache': 'redis-hit' | 'redis-miss' | 'edge-hit' | 'db-fallback';
  'x-cache-key': string;
  'x-geohash': string;
  'x-ttl-remaining': string;
  'Server-Timing': string;
}

class RedisCache {
  private redisUrl: string;
  
  constructor() {
    this.redisUrl = Deno.env.get('REDIS_URL') || '';
    console.log('Redis URL configured:', this.redisUrl ? 'YES' : 'NO');
  }

  private async makeRedisRequest(command: string[]): Promise<any> {
    if (!this.redisUrl) {
      console.log('❌ Redis not configured, skipping cache');
      return null;
    }

    try {
      // Parse Redis URL to get auth info
      const url = new URL(this.redisUrl);
      const auth = url.password;
      const host = url.hostname;
      const port = url.port || '6379';
      
      console.log(`📡 Redis request: ${command[0]} to ${host}:${port}`);
      
      // Use Upstash Redis HTTP API
      const response = await fetch(`https://${host}/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(command)
      });
      
      if (!response.ok) {
        console.error('❌ Redis request failed:', response.status, response.statusText);
        return null;
      }
      
      const result = await response.json();
      console.log(`✅ Redis response:`, result);
      return result.result;
    } catch (error) {
      console.error('❌ Redis error:', error);
      return null;
    }
  }

  async get(key: string): Promise<any> {
    const result = await this.makeRedisRequest(['GET', key]);
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }
    return null;
  }

  async set(key: string, value: any, ttl: number = 60): Promise<boolean> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const result = await this.makeRedisRequest(['SETEX', key, ttl.toString(), serialized]);
    return result === 'OK';
  }

  async del(pattern: string): Promise<number> {
    const keys = await this.makeRedisRequest(['KEYS', pattern]);
    if (keys && keys.length > 0) {
      const result = await this.makeRedisRequest(['DEL', ...keys]);
      return result || 0;
    }
    return 0;
  }
}

function generateGeohash(lat: number, lon: number, precision: number = 7): string {
  // Simplified geohash for consistent cache keys
  const latBin = Math.floor((lat + 90) * Math.pow(2, precision / 2));
  const lonBin = Math.floor((lon + 180) * Math.pow(2, precision / 2));
  return `${latBin.toString(36)}_${lonBin.toString(36)}`;
}

function generateCacheKey(params: FeedParams & { geohash: string }): string {
  const {
    geohash,
    searchQuery = '',
    cuisineTypeIds = [],
    priceRanges = [],
    selectedEstablishmentTypes = [],
    selectedDietCategories = [],
    isHighRated = false,
    maxDistance = 50,
    sortBy = 'distance'
  } = params;

  const normalizedQuery = searchQuery.toLowerCase().trim();
  const sortedCuisines = [...cuisineTypeIds].sort().join(',');
  const sortedPrices = [...priceRanges].sort().join(',');
  const sortedEstablishments = [...selectedEstablishmentTypes].sort().join(',');
  const sortedDiets = [...selectedDietCategories].sort().join(',');
  const rating = isHighRated ? '4.5+' : '';
  const distance = Math.round(maxDistance);

  return `feed:v2:${geohash}:${normalizedQuery}:${sortedCuisines}:${sortedPrices}:${sortedEstablishments}:${sortedDiets}:${rating}:${distance}km:${sortBy}`;
}

async function fetchFromDatabase(supabase: any, params: FeedParams): Promise<any> {
  console.log('🔍 Fetching from database:', params);
  
  const rpcParams = {
    search_query: params.searchQuery?.trim() || '',
    user_lat: params.userLat || null,
    user_lon: params.userLng || null,
    max_distance_km: params.maxDistance || 50,
    cuisine_type_ids: params.cuisineTypeIds && params.cuisineTypeIds.length > 0 ? params.cuisineTypeIds : null,
    price_ranges: params.priceRanges && params.priceRanges.length > 0 ? params.priceRanges : null,
    establishment_type_ids: params.selectedEstablishmentTypes && params.selectedEstablishmentTypes.length > 0 ? params.selectedEstablishmentTypes : null,
    diet_categories: params.selectedDietCategories && params.selectedDietCategories.length > 0 ? params.selectedDietCategories : null,
    min_rating: params.isHighRated ? 4.5 : null,
    is_open_now: false,
    max_results: 50
  };

  console.log('📊 RPC Params:', rpcParams);

  const { data, error } = await supabase.rpc('search_restaurant_feed', rpcParams);
  
  if (error) {
    console.error('❌ Database error:', error);
    throw error;
  }

  console.log(`✅ Database returned ${data?.length || 0} restaurants`);
  return data || [];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();
  let cacheStatus: CacheHeaders['x-cache'] = 'db-fallback';
  let cacheKey = '';
  let geohash = '';
  let ttlRemaining = '0';

  try {
    console.log(`🚀 Processing ${req.method} request to cached-restaurant-feed`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // ✅ FIX: Parse query parameters from URL
    const url = new URL(req.url);
    const { searchParams } = url;
    
    const params: FeedParams = {
      searchQuery: searchParams.get('searchQuery') || undefined,
      userLat: searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : undefined,
      userLng: searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : undefined,
      maxDistance: searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : 50,
      cuisineTypeIds: searchParams.get('cuisineTypeIds') ? JSON.parse(searchParams.get('cuisineTypeIds')!) : undefined,
      priceRanges: searchParams.get('priceRanges') ? JSON.parse(searchParams.get('priceRanges')!) : undefined,
      selectedEstablishmentTypes: searchParams.get('selectedEstablishmentTypes') ? JSON.parse(searchParams.get('selectedEstablishmentTypes')!) : undefined,
      selectedDietCategories: searchParams.get('selectedDietCategories') ? JSON.parse(searchParams.get('selectedDietCategories')!) : undefined,
      isHighRated: searchParams.get('isHighRated') === 'true',
      sortBy: (searchParams.get('sortBy') as 'distance' | 'rating' | 'favorites') || 'distance'
    };

    console.log('📋 Parsed parameters:', params);

    // Generate geohash and cache key
    if (params.userLat && params.userLng) {
      geohash = generateGeohash(params.userLat, params.userLng, 7);
      cacheKey = generateCacheKey({ ...params, geohash });
      console.log('🔑 Cache key:', cacheKey);
    }

    let data: any[] = [];
    const redis = new RedisCache();

    // ✅ Try Redis cache first
    if (cacheKey) {
      console.log('🔍 Checking Redis cache...');
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('🎯 Redis cache HIT!');
        data = cached.data || cached;
        cacheStatus = 'redis-hit';
        ttlRemaining = '60'; // Approximate
      } else {
        console.log('❌ Redis cache MISS');
      }
    }

    // ✅ Fallback to database
    if (data.length === 0) {
      console.log('📊 Fetching from database...');
      const dbStartTime = performance.now();
      
      data = await fetchFromDatabase(supabase, params);
      cacheStatus = 'db-fallback';
      
      const dbTime = performance.now() - dbStartTime;
      console.log(`⏱️ Database query took ${dbTime.toFixed(2)}ms`);

      // ✅ Cache the result
      if (cacheKey && data.length > 0) {
        console.log('💾 Caching result in Redis...');
        const cached = await redis.set(cacheKey, { data, timestamp: Date.now() }, 60);
        if (cached) {
          console.log('✅ Successfully cached in Redis');
        } else {
          console.log('❌ Failed to cache in Redis');
        }
      }
    }

    const totalTime = performance.now() - startTime;
    console.log(`🏁 Total request time: ${totalTime.toFixed(2)}ms`);

    // ✅ Response headers
    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'x-cache': cacheStatus,
      'x-cache-key': cacheKey,
      'x-geohash': geohash,
      'x-ttl-remaining': ttlRemaining,
      'Server-Timing': `total;dur=${totalTime.toFixed(2)}`,
      // Cache control headers
      'Cache-Control': cacheStatus === 'redis-hit' 
        ? 'public, max-age=30, stale-while-revalidate=60'
        : 'private, no-cache'
    };

    return new Response(JSON.stringify(data), {
      headers: responseHeaders
    });

  } catch (error) {
    console.error('💥 Error in cached-restaurant-feed:', error);
    
    const totalTime = performance.now() - startTime;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      cacheStatus: 'error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'x-cache': 'error',
        'Server-Timing': `total;dur=${totalTime.toFixed(2)}`
      }
    });
  }
});
