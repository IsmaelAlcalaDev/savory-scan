
import { supabase } from '@/integrations/supabase/client'

interface AnalyticsEvent {
  session_id: string
  user_id?: string
  restaurant_id?: number
  dish_id?: number
  event_type: string
  event_name: string
  event_value?: Record<string, any>
}

class AnalyticsService {
  private sessionId: string
  private userId: string | null = null
  private eventQueue: AnalyticsEvent[] = []
  private isOnline = true
  private retryTimeouts: Set<NodeJS.Timeout> = new Set()
  private lastSendTime = 0
  private readonly BATCH_SIZE = 10
  private readonly BATCH_TIMEOUT = 2000 // 2 seconds
  private readonly RETRY_DELAY = 5000 // 5 seconds
  private readonly MIN_SEND_INTERVAL = 100 // Throttle sends to max 10/second

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeSession()
    this.setupEventListeners()
    this.startBatchProcessor()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private async initializeSession() {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser()
      this.userId = user?.id || null

      // Send session creation event to Edge Function
      const sessionData = {
        id: this.sessionId,
        started_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        geo_city: null, // Could be populated by IP geolocation if needed
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      // The Edge Function will handle session creation
      await supabase.functions.invoke('analytics', {
        body: {
          type: 'session_create',
          session_data: sessionData
        }
      })
    } catch (error) {
      console.warn('Failed to create analytics session:', error)
    }
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null
    })
  }

  private startBatchProcessor() {
    setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.processQueue()
      }
    }, this.BATCH_TIMEOUT)
  }

  public track(eventType: string, eventName: string, properties?: {
    restaurant_id?: number
    dish_id?: number
    value?: Record<string, any>
  }) {
    const event: AnalyticsEvent = {
      session_id: this.sessionId,
      user_id: this.userId || undefined,
      restaurant_id: properties?.restaurant_id,
      dish_id: properties?.dish_id,
      event_type: eventType,
      event_name: eventName,
      event_value: properties?.value
    }

    this.eventQueue.push(event)

    // Process immediately if queue is full or if we're online and not throttled
    if (this.eventQueue.length >= this.BATCH_SIZE || 
        (this.isOnline && Date.now() - this.lastSendTime > this.MIN_SEND_INTERVAL)) {
      this.processQueue()
    }
  }

  private async processQueue() {
    if (!this.isOnline || this.eventQueue.length === 0) {
      return
    }

    // Throttle sends
    const now = Date.now()
    if (now - this.lastSendTime < this.MIN_SEND_INTERVAL) {
      return
    }

    const batch = this.eventQueue.splice(0, this.BATCH_SIZE)
    this.lastSendTime = now

    try {
      const { error } = await supabase.functions.invoke('analytics', {
        body: {
          type: 'events',
          events: batch
        }
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.warn('Failed to send analytics batch:', error)
      
      // Re-queue events for retry
      this.eventQueue.unshift(...batch)
      
      // Schedule retry
      const timeout = setTimeout(() => {
        this.retryTimeouts.delete(timeout)
        this.processQueue()
      }, this.RETRY_DELAY)
      
      this.retryTimeouts.add(timeout)
    }
  }

  // Cleanup method
  public destroy() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts.clear()
  }
}

// Create singleton instance
export const analytics = new AnalyticsService()
