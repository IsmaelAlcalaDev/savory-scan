
import { useCallback } from 'react'
import RestaurantCard from './RestaurantCard'
import { useAnalytics } from '@/hooks/useAnalytics'

interface InstrumentedRestaurantCardProps {
  id: number
  name: string
  slug: string
  description?: string
  priceRange: string
  googleRating?: number
  googleRatingCount?: number
  distance?: number
  cuisineTypes: string[]
  establishmentType?: string
  services?: string[]
  favoritesCount?: number
  coverImageUrl?: string
  logoUrl?: string
  onClick?: () => void
  className?: string
  onLoginRequired?: () => void
  layout?: 'grid' | 'list'
  onFavoriteChange?: (restaurantId: number, isFavorite: boolean) => void
  priority?: boolean
  position?: number
}

export default function InstrumentedRestaurantCard(props: InstrumentedRestaurantCardProps) {
  const { trackCardClick } = useAnalytics()

  const handleClick = useCallback(() => {
    trackCardClick(props.id, props.position)
    
    if (props.onClick) {
      props.onClick()
    } else {
      window.location.href = `/restaurant/${props.slug}`
    }
  }, [props.id, props.position, props.onClick, props.slug, trackCardClick])

  return (
    <RestaurantCard
      {...props}
      onClick={handleClick}
      data-analytics-restaurant-id={props.id}
      data-analytics-action="restaurant-click"
    />
  )
}
