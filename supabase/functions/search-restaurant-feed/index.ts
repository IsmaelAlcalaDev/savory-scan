
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
      bypass_rpc = false // Parameter for rollback
    } = await req.json()

    console.log('Search restaurant feed request:', {
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
      bypass_rpc
    })

    // If bypass_rpc is true, return minimal response to force fallback
    if (bypass_rpc) {
      console.log('RPC bypassed, returning empty result for fallback')
      return new Response(
        JSON.stringify({ 
          data: [],
          message: 'RPC bypassed for rollback',
          system: 'fallback'
        }),
        { 
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Server-Timing': `feed;dur=0`,
            'X-System-Type': 'bypassed'
          }
        }
      )
    }

    // Format diet categories for the new RPC function
    const dietString = diet_categories && Array.isArray(diet_categories) && diet_categories.length > 0 
      ? diet_categories.join(',') 
      : null;

    // Call the new optimized RPC function
    const { data, error } = await supabase.rpc('search_restaurant_feed', {
      p_q: search_query,
      p_lat: user_lat || null,
      p_lon: user_lon || null,
      p_max_km: max_distance_km,
      p_cuisines: cuisine_type_ids && cuisine_type_ids.length > 0 ? cuisine_type_ids : null,
      p_price_bands: price_ranges && price_ranges.length > 0 ? price_ranges : null,
      p_est_types: establishment_type_ids && establishment_type_ids.length > 0 ? establishment_type_ids : null,
      p_diet: dietString,
      p_min_rating: min_rating || null,
      p_limit: max_results
    })

    const endTime = performance.now()
    const duration = endTime - startTime

    // Log performance sample to database
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'performance',
        event_name: 'search_restaurant_feed_edge',
        properties: {
          duration_ms: duration,
          results_count: data?.length || 0,
          has_diet_filter: !!dietString,
          diet_categories: diet_categories || [],
          timestamp: Date.now()
        }
      });
    } catch (logError) {
      console.warn('Failed to log performance:', logError);
    }

    if (error) {
      console.error('RPC error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Server-Timing': `feed;dur=${duration.toFixed(3)}`,
            'X-System-Type': 'rpc-error'
          }
        }
      )
    }

    console.log(`Optimized feed search completed in ${duration.toFixed(3)}ms, found ${data?.length || 0} restaurants`)

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Server-Timing': `feed;dur=${duration.toFixed(3)}`,
          'X-System-Type': 'rpc-optimized'
        }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-System-Type': 'edge-error'
        }
      }
    )
  }
})
