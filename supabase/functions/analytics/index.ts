
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

interface SessionData {
  id: string
  started_at: string
  user_agent: string
  referrer: string | null
  geo_city: string | null
  timezone: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, events, session_data }: { 
      type: 'events' | 'session_create'
      events?: AnalyticsEvent[]
      session_data?: SessionData
    } = await req.json()

    if (type === 'session_create' && session_data) {
      // Handle session creation
      const { error: sessionError } = await supabase
        .from('analytics_sessions')
        .insert({
          id: session_data.id,
          started_at: session_data.started_at,
          user_agent: session_data.user_agent,
          referrer: session_data.referrer,
          geo_city: session_data.geo_city,
          timezone: session_data.timezone
        })

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        // Don't throw error, just log it - sessions are nice to have but not critical
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (type === 'events' && events && events.length > 0) {
      // Validate events
      const validEvents = events.filter(event => 
        event.session_id && 
        event.event_type && 
        event.event_name
      )

      if (validEvents.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid events provided' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Prepare events for insertion
      const eventsToInsert = validEvents.map(event => ({
        session_id: event.session_id,
        user_id: event.user_id || null,
        restaurant_id: event.restaurant_id || null,
        dish_id: event.dish_id || null,
        event_type: event.event_type,
        event_name: event.event_name,
        event_value: event.event_value || {}
      }))

      // Insert events in batch
      const { error: insertError } = await supabase
        .from('analytics_events')
        .insert(eventsToInsert)

      if (insertError) {
        console.error('Analytics insert error:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to insert events' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: eventsToInsert.length 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Analytics function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
