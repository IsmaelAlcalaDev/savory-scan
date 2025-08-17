
interface AnalyticsEvent {
  session_id?: string;
  event_type: string;
  event_name?: string;
  restaurant_id?: number;
  dish_id?: number;
  event_value?: Record<string, any>;
  user_id?: string;
}

interface SessionData {
  user_agent?: string;
  referrer?: string;
  geo_city?: string;
  timezone?: string;
}

class AnalyticsManager {
  private sessionId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = true;
  private retryCount = 0;
  private maxRetries = 3;
  private flushTimeout: NodeJS.Timeout | null = null;
  private rateLimitCount = 0;
  private rateLimitWindow = Date.now();
  private readonly maxEventsPerMinute = 50;
  private readonly batchSize = 10;
  private readonly flushInterval = 2000; // 2 seconds

  constructor() {
    this.initializeSession();
    this.setupEventListeners();
  }

  private async initializeSession(): Promise<void> {
    try {
      // Check if we have a session in localStorage (within last hour)
      const storedSession = localStorage.getItem('analytics_session');
      if (storedSession) {
        const { sessionId, timestamp } = JSON.parse(storedSession);
        const oneHour = 60 * 60 * 1000;
        
        if (Date.now() - timestamp < oneHour) {
          this.sessionId = sessionId;
          return;
        }
      }

      // Create new session
      const sessionData: SessionData = {
        user_agent: navigator.userAgent.substring(0, 500),
        referrer: document.referrer.substring(0, 500) || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        geo_city: undefined // Will be determined server-side if needed
      };

      const response = await fetch('https://ncpnlnucffgoscufyyyx.supabase.co/functions/v1/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcG5sbnVjZmZnb3NjdWZ5eXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTAxMzcsImV4cCI6MjA3MDE4NjEzN30.z7khN0Q3p7IPCsCoB1ZG-3VnD1k_YbdvagQoZpdX2fM`
        },
        body: JSON.stringify({
          action: 'create_session',
          session_data: sessionData
        })
      });

      if (response.ok) {
        const { session_id } = await response.json();
        this.sessionId = session_id;
        
        // Store session for future use
        localStorage.setItem('analytics_session', JSON.stringify({
          sessionId: session_id,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.debug('Analytics session creation failed:', error);
      // Continue without session - events will still be tracked
    }
  }

  private setupEventListeners(): void {
    // Handle online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEventsSync();
    });

    // Auto-flush events periodically
    this.scheduleFlush();
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinute = 60 * 1000;

    // Reset rate limit window if needed
    if (now > this.rateLimitWindow + oneMinute) {
      this.rateLimitCount = 0;
      this.rateLimitWindow = now;
    }

    if (this.rateLimitCount >= this.maxEventsPerMinute) {
      console.debug('Analytics rate limit exceeded');
      return false;
    }

    this.rateLimitCount++;
    return true;
  }

  public track(eventType: string, eventData?: {
    event_name?: string;
    restaurant_id?: number;
    dish_id?: number;
    event_value?: Record<string, any>;
  }): void {
    try {
      if (!this.checkRateLimit()) {
        return;
      }

      const event: AnalyticsEvent = {
        session_id: this.sessionId || undefined,
        event_type: eventType,
        event_name: eventData?.event_name,
        restaurant_id: eventData?.restaurant_id,
        dish_id: eventData?.dish_id,
        event_value: eventData?.event_value || {}
      };

      this.eventQueue.push(event);

      // Auto-flush if queue is getting full
      if (this.eventQueue.length >= this.batchSize) {
        this.flushEvents();
      }
    } catch (error) {
      console.debug('Analytics tracking error:', error);
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flushEvents();
      this.scheduleFlush();
    }, this.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = this.eventQueue.splice(0, this.batchSize);

    try {
      const response = await fetch('https://ncpnlnucffgoscufyyyx.supabase.co/functions/v1/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcG5sbnVjZmZnb3NjdWZ5eXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MTAxMzcsImV4cCI6MjA3MDE4NjEzN30.z7khN0Q3p7IPCsCoB1ZG-3VnD1k_YbdvagQoZpdX2fM`
        },
        body: JSON.stringify({
          events: eventsToSend
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      this.retryCount = 0;
    } catch (error) {
      console.debug('Analytics flush failed:', error);
      
      // Retry logic with exponential backoff
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        // Put events back in queue for retry
        this.eventQueue.unshift(...eventsToSend);
        
        // Retry with exponential backoff
        setTimeout(() => {
          this.flushEvents();
        }, Math.pow(2, this.retryCount) * 1000);
      }
    }
  }

  private flushEventsSync(): void {
    if (this.eventQueue.length === 0) {
      return;
    }

    try {
      // Use sendBeacon for synchronous sending during page unload
      const eventsToSend = this.eventQueue.splice(0, this.batchSize);
      const payload = JSON.stringify({ events: eventsToSend });
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          'https://ncpnlnucffgoscufyyyx.supabase.co/functions/v1/analytics',
          payload
        );
      }
    } catch (error) {
      console.debug('Analytics sync flush failed:', error);
    }
  }

  // Convenience methods for common events
  public trackSearch(query: string, filters?: Record<string, any>): void {
    this.track('search_submitted', {
      event_name: 'search',
      event_value: { query: query.substring(0, 100), filters }
    });
  }

  public trackFilterToggle(filterType: string, filterValue: string, isActive: boolean): void {
    this.track('filter_toggled', {
      event_name: filterType,
      event_value: { filter_value: filterValue, is_active: isActive }
    });
  }

  public trackCardClick(type: 'restaurant' | 'dish', id: number): void {
    this.track('card_click_open', {
      event_name: `${type}_card_click`,
      restaurant_id: type === 'restaurant' ? id : undefined,
      dish_id: type === 'dish' ? id : undefined
    });
  }

  public trackActionClick(action: 'call' | 'directions' | 'menu', restaurantId?: number): void {
    this.track(`${action}_click`, {
      event_name: action,
      restaurant_id: restaurantId
    });
  }

  public trackFavorite(action: 'add' | 'remove', type: 'restaurant' | 'dish', id: number): void {
    this.track(`favorite_${action}`, {
      event_name: `${type}_favorite`,
      restaurant_id: type === 'restaurant' ? id : undefined,
      dish_id: type === 'dish' ? id : undefined
    });
  }

  public trackFeedImpression(restaurantIds: number[]): void {
    this.track('feed_impression', {
      event_name: 'restaurant_list_view',
      event_value: { restaurant_ids: restaurantIds.slice(0, 20) } // Limit to first 20
    });
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();
