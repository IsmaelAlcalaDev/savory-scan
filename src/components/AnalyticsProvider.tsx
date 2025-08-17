
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useActionTracking } from '@/hooks/useActionTracking'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation()
  const params = useParams()
  const { trackRestaurantView } = useAnalytics()
  
  // Set up action tracking
  useActionTracking()

  // Track page views for restaurant profiles
  useEffect(() => {
    if (location.pathname.startsWith('/restaurant/') && params.slug) {
      // Extract restaurant ID from context if available
      // For now, we'll track without ID and let the hook infer it
      trackRestaurantView()
    }
  }, [location.pathname, params.slug, trackRestaurantView])

  return <>{children}</>
}
