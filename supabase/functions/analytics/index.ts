
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AnalyticsEvent {
  session_id?: string
  event_type: string
  event_name?: string
  restaurant_id?: number
  dish_id?: number
  event_value?: Record<string, any>
  user_id?: string
}

interface SessionData {
  user_agent?: string
  referrer?: string
  geo_city?: string
  timezone?: string
}

// Rate limiting store (in-memory for edge function)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(clientId: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (clientData.count >= maxRequests) {
    return false
  }
  
  clientData.count++
  return true
}

function validateEvent(event: any): event is AnalyticsEvent {
  return (
    typeof event === 'object' &&
    typeof event.event_type === 'string' &&
    event.event_type.length > 0 &&
    event.event_type.length <= 50 &&
    (!event.event_name || (typeof event.event_name === 'string' && event.event_name.length <= 100)) &&
    (!event.restaurant_id || typeof event.restaurant_id === 'number') &&
    (!event.dish_id || typeof event.dish_id === 'number') &&
    (!event.session_id || typeof event.session_id === 'string') &&
    (!event.event_value || typeof event.event_value === 'object')
  )
}

function validateSessionData(data: any): data is SessionData {
  return (
    typeof data === 'object' &&
    (!data.user_agent || (typeof data.user_agent === 'string' && data.user_agent.length <= 500)) &&
    (!data.referrer || (typeof data.referrer === 'string' && data.referrer.length <= 500)) &&
    (!data.geo_city || (typeof data.geo_city === 'string' && data.geo_city.length <= 100)) &&
    (!data.timezone || (typeof data.timezone === 'string' && data.timezone.length <= 50))
  )
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(clientIp)) {
      return new Response('Rate limit exceeded', { 
        status: 429, 
        headers: corsHeaders 
      })
    }

    const body = await req.json()
    
    // Handle session creation
    if (body.action === 'create_session') {
      if (!validateSessionData(body.session_data)) {
        return new Response('Invalid session data', { 
          status: 400, 
          headers: corsHeaders 
        })
      }

      const { data, error } = await supabase.rpc('create_analytics_session', {
        p_user_agent: body.session_data.user_agent || null,
        p_referrer: body.session_data.referrer || null,
        p_geo_city: body.session_data.geo_city || null,
        p_timezone: body.session_data.timezone || null
      })

      if (error) {
        console.error('Session creation error:', error)
        return new Response('Failed to create session', { 
          status: 500, 
          headers: corsHeaders 
        })
      }

      return new Response(JSON.stringify({ session_id: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle event tracking
    const events = Array.isArray(body.events) ? body.events : [body]
    
    if (events.length === 0 || events.length > 50) {
      return new Response('Invalid batch size', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    const validEvents = events.filter(validateEvent)
    
    if (validEvents.length === 0) {
      return new Response('No valid events', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Insert events in batch
    const eventsToInsert = validEvents.map(event => ({
      session_id: event.session_id || null,
      user_id: event.user_id || null,
      event_type: event.event_type,
      event_name: event.event_name || null,
      restaurant_id: event.restaurant_id || null,
      dish_id: event.dish_id || null,
      event_value: event.event_value || {}
    }))

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventsToInsert)

    if (error) {
      console.error('Event insertion error:', error)
      return new Response('Failed to store events', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: validEvents.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
