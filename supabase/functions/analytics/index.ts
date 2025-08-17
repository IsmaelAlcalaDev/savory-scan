
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface AnalyticsEvent {
  session_id: string
  user_id?: string
  restaurant_id?: number
  dish_id?: number
  event_type: string
  event_name: string
  event_value?: Record<string, any>
}

// Rate limiting map (in-memory, simple)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return true
  }
  
  if (limit.count >= 100) { // 100 events per minute per IP
    return false
  }
  
  limit.count++
  return true
}

function validateEvent(event: any): event is AnalyticsEvent {
  return (
    typeof event.session_id === 'string' &&
    typeof event.event_type === 'string' &&
    typeof event.event_name === 'string' &&
    (event.user_id === undefined || typeof event.user_id === 'string') &&
    (event.restaurant_id === undefined || typeof event.restaurant_id === 'number') &&
    (event.dish_id === undefined || typeof event.dish_id === 'number')
  )
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body = await req.json()
    
    // Handle both single event and batch events
    const events = Array.isArray(body) ? body : [body]
    
    // Validate all events
    const validEvents = events.filter(validateEvent)
    
    if (validEvents.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid events provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert events in batch
    const { error } = await supabase
      .from('analytics_events')
      .insert(validEvents.map(event => ({
        session_id: event.session_id,
        user_id: event.user_id || null,
        restaurant_id: event.restaurant_id || null,
        dish_id: event.dish_id || null,
        event_type: event.event_type,
        event_name: event.event_name,
        event_value: event.event_value || {}
      })))

    if (error) {
      console.error('Database insert error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, processed: validEvents.length }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Analytics function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
