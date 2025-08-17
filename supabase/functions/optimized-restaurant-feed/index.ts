
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const startTime = performance.now()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      search_query = '',
      user_lat,
      user_lon,
      max_distance_km = 50,
      cuisine_type_ids,
      price_ranges,
      establishment_type_ids,
      diet_categories,
      min_rating,
      is_open_now = false,
      max_results = 50,
      cache_key = null
    } = await req.json()

    console.log('Optimized restaurant feed request:', {
      search_query,
      user_lat,
      user_lon,
      max_distance_km,
      cuisine_type_ids,
      price_ranges,
      establishment_type_ids,
      diet_categories,
      min_rating,
      is_open_now,
      max_results,
      cache_key
    })

    // Call the optimized RPC function using materialized view
    const { data, error } = await supabase.rpc('search_restaurant_feed', {
      search_query,
      user_lat,
      user_lon,
      max_distance_km,
      cuisine_type_ids,
      price_ranges,
      establishment_type_ids,
      diet_categories,
      min_rating,
      is_open_now,
      max_results
    })

    const endTime = performance.now()
    const duration = endTime - startTime

    // Log performance sample to database (non-blocking)
    setTimeout(async () => {
      try {
        await supabase.rpc('log_feed_performance', { duration_ms: duration })
      } catch (logError) {
        console.warn('Failed to log performance:', logError)
      }
    }, 0)

    if (error) {
      console.error('Optimized RPC error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Server-Timing': `feed;dur=${duration.toFixed(3)}`,
            'X-System-Type': 'optimized-rpc-error',
            'X-Cache-Key': cache_key || 'none'
          }
        }
      )
    }

    console.log(`Optimized feed search completed in ${duration.toFixed(3)}ms, found ${data?.length || 0} restaurants`)

    return new Response(
      JSON.stringify({ 
        data,
        meta: {
          system_type: 'optimized_audit',
          duration_ms: duration,
          result_count: data?.length || 0,
          cache_key: cache_key
        }
      }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Server-Timing': `feed;dur=${duration.toFixed(3)}`,
          'X-System-Type': 'optimized-audit-success',
          'X-Cache-Key': cache_key || 'none',
          'X-Result-Count': String(data?.length || 0)
        }
      }
    )

  } catch (error) {
    console.error('Optimized edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-System-Type': 'optimized-edge-error'
        }
      }
    )
  }
})
