
import { useEffect } from 'react'
import { useAnalytics } from './useAnalytics'

export function useActionTracking() {
  const { trackCall, trackDirections, trackMenuOpen, trackGalleryOpen } = useAnalytics()

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest('[data-analytics-action]') as HTMLElement
      
      if (!button) return

      const action = button.getAttribute('data-analytics-action')
      const restaurantId = parseInt(button.getAttribute('data-analytics-restaurant-id') || '0') || undefined

      switch (action) {
        case 'call-click':
          trackCall(restaurantId)
          break
        case 'directions-click':
          trackDirections(restaurantId)
          break
        case 'menu-open':
          trackMenuOpen(restaurantId)
          break
        case 'gallery-open':
          trackGalleryOpen(restaurantId)
          break
      }
    }

    document.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [trackCall, trackDirections, trackMenuOpen, trackGalleryOpen])
}
