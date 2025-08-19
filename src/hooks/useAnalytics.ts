
import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { analytics } from '@/services/analytics'

export function useAnalytics() {
  const location = useLocation()
  const params = useParams()
  const lastEventRef = useRef<{ [key: string]: number }>({})

  // Get context from URL
  const restaurantId = params.slug ? extractRestaurantIdFromSlug(params.slug) : undefined
  
  // Throttle identical events
  const throttleEvent = useCallback((eventKey: string, throttleMs: number = 1000): boolean => {
    const now = Date.now()
    const lastTime = lastEventRef.current[eventKey] || 0
    
    if (now - lastTime < throttleMs) {
      return false
    }
    
    lastEventRef.current[eventKey] = now
    return true
  }, [])

  const trackEvent = useCallback((
    eventType: string, 
    eventName: string, 
    properties?: {
      restaurant_id?: number
      dish_id?: number
      value?: Record<string, any>
      throttle?: number
    }
  ) => {
    const eventKey = `${eventType}:${eventName}:${properties?.restaurant_id || ''}:${properties?.dish_id || ''}`
    
    if (properties?.throttle && !throttleEvent(eventKey, properties.throttle)) {
      return
    }

    analytics.track(eventType, eventName, {
      restaurant_id: properties?.restaurant_id || restaurantId,
      dish_id: properties?.dish_id,
      value: properties?.value
    })
  }, [restaurantId, throttleEvent])

  // Convenience methods for common events
  const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
    trackEvent('search', 'search_submitted', {
      value: { query, filters }
    })
  }, [trackEvent])

  const trackFilter = useCallback((filterType: string, filterValue: any) => {
    trackEvent('filter', 'filter_toggled', {
      value: { filter_type: filterType, filter_value: filterValue },
      throttle: 500
    })
  }, [trackEvent])

  const trackFeedImpression = useCallback((restaurantIds: number[]) => {
    trackEvent('feed', 'feed_impression', {
      value: { restaurant_count: restaurantIds.length, restaurant_ids: restaurantIds },
      throttle: 2000
    })
  }, [trackEvent])

  const trackCardClick = useCallback((restaurantId: number, position?: number) => {
    trackEvent('interaction', 'card_click_open', {
      restaurant_id: restaurantId,
      value: { position }
    })
  }, [trackEvent])

  const trackFavorite = useCallback((action: 'add' | 'remove', restaurantId?: number, dishId?: number) => {
    const eventName = `favorite_${action}`
    trackEvent('favorite', eventName, {
      restaurant_id: restaurantId,
      dish_id: dishId
    })
  }, [trackEvent])

  const trackCall = useCallback((restaurantId?: number) => {
    trackEvent('interaction', 'call_click', {
      restaurant_id: restaurantId || restaurantId
    })
  }, [trackEvent, restaurantId])

  const trackDirections = useCallback((restaurantId?: number) => {
    trackEvent('interaction', 'directions_click', {
      restaurant_id: restaurantId || restaurantId
    })
  }, [trackEvent, restaurantId])

  const trackMenuOpen = useCallback((restaurantId?: number) => {
    trackEvent('navigation', 'menu_open', {
      restaurant_id: restaurantId || restaurantId
    })
  }, [trackEvent, restaurantId])

  const trackRestaurantView = useCallback((restaurantId?: number) => {
    trackEvent('view', 'restaurant_view', {
      restaurant_id: restaurantId || restaurantId,
      throttle: 5000 // Only track once per 5 seconds
    })
  }, [trackEvent, restaurantId])

  const trackGalleryOpen = useCallback((restaurantId?: number) => {
    trackEvent('interaction', 'gallery_open', {
      restaurant_id: restaurantId || restaurantId
    })
  }, [trackEvent, restaurantId])

  return {
    trackEvent,
    trackSearch,
    trackFilter,
    trackFeedImpression,
    trackCardClick,
    trackFavorite,
    trackCall,
    trackDirections,
    trackMenuOpen,
    trackRestaurantView,
    trackGalleryOpen
  }
}

// Helper function to extract restaurant ID from slug
// This would need to be implemented based on your slug structure
function extractRestaurantIdFromSlug(slug: string): number | undefined {
  // If your slugs contain the ID, extract it
  // For now, return undefined as we'll pass IDs explicitly
  return undefined
}
