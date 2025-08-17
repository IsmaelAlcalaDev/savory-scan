
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvalidationRequest {
  restaurantId?: number;
  geohash?: string;
  cityId?: number;
  global?: boolean;
}

class RedisCache {
  private redisUrl: string;
  
  constructor() {
    this.redisUrl = Deno.env.get('REDIS_URL') || '';
  }

  private async makeRedisRequest(command: string[]): Promise<any> {
    if (!this.redisUrl) {
      console.log('Redis not configured, skipping cache invalidation');
      return null;
    }

    try {
      const response = await fetch(`${this.redisUrl}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Redis error:', error);
      return null;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    console.log('Deleting cache pattern:', pattern);
    
    const keys = await this.makeRedisRequest(['KEYS', pattern]);
    if (keys && keys.length > 0) {
      const result = await this.makeRedisRequest(['DEL', ...keys]);
      console.log(`Deleted ${result || 0} cache keys`);
      return result || 0;
    }
    return 0;
  }

  async flushAll(): Promise<boolean> {
    console.log('Flushing all cache');
    const result = await this.makeRedisRequest(['FLUSHALL']);
    return result === 'OK';
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: InvalidationRequest = await req.json();
    console.log('Cache invalidation request:', body);

    const redis = new RedisCache();
    let deletedKeys = 0;

    if (body.global) {
      // Global cache flush - use carefully
      console.log('Performing global cache flush');
      await redis.flushAll();
      deletedKeys = -1; // Indicate full flush
    } else if (body.geohash) {
      // Invalidate specific geohash area
      const pattern = `feed:v2:${body.geohash}:*`;
      deletedKeys = await redis.deletePattern(pattern);
    } else if (body.restaurantId) {
      // Invalidate all cache entries (conservative approach)
      // In a more sophisticated implementation, we'd track which 
      // cache keys contain which restaurants
      const pattern = 'feed:v2:*';
      deletedKeys = await redis.deletePattern(pattern);
    } else {
      // Default: invalidate all feed cache
      const pattern = 'feed:v2:*';
      deletedKeys = await redis.deletePattern(pattern);
    }

    console.log(`Cache invalidation completed. Deleted ${deletedKeys} keys`);

    return new Response(JSON.stringify({ 
      success: true,
      deletedKeys,
      pattern: body.geohash ? `feed:v2:${body.geohash}:*` : 'feed:v2:*'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in invalidate-cache:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
