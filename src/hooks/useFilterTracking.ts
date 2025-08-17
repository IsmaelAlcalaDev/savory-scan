
import { useCallback } from 'react'
import { useAnalytics } from './useAnalytics'

export function useFilterTracking() {
  const { trackFilter } = useAnalytics()

  const trackCuisineFilter = useCallback((cuisineIds: number[]) => {
    trackFilter('cuisine', cuisineIds)
  }, [trackFilter])

  const trackPriceFilter = useCallback((priceRanges: string[]) => {
    trackFilter('price', priceRanges)
  }, [trackFilter])

  const trackEstablishmentFilter = useCallback((types: number[]) => {
    trackFilter('establishment_type', types)
  }, [trackFilter])

  const trackDietFilter = useCallback((dietTypes: number[] | string[]) => {
    trackFilter('diet', dietTypes)
  }, [trackFilter])

  const trackRatingFilter = useCallback((isHighRated: boolean) => {
    trackFilter('rating', isHighRated)
  }, [trackFilter])

  const trackDistanceFilter = useCallback((maxDistance: number) => {
    trackFilter('distance', maxDistance)
  }, [trackFilter])

  return {
    trackCuisineFilter,
    trackPriceFilter,
    trackEstablishmentFilter,
    trackDietFilter,
    trackRatingFilter,
    trackDistanceFilter
  }
}
