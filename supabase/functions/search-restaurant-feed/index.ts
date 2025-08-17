
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
      max_results = 50
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
      max_results
    })

    // Call the existing RPC function
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

    // Log performance sample to database
    await supabase.rpc('log_feed_performance', { duration_ms: duration })

    if (error) {
      console.error('RPC error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Server-Timing': `feed;dur=${duration.toFixed(3)}`
          }
        }
      )
    }

    console.log(`Feed search completed in ${duration.toFixed(3)}ms, found ${data?.length || 0} restaurants`)

    return new Response(
      JSON.stringify({ data }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Server-Timing': `feed;dur=${duration.toFixed(3)}`
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
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
