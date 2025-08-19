
import { useCallback } from 'react'
import FavoriteButton from './FavoriteButton'
import { useAnalytics } from '@/hooks/useAnalytics'

interface InstrumentedFavoriteButtonProps {
  restaurantId?: number
  dishId?: number
  favoritesCount: number
  savedFrom?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onLoginRequired?: () => void
  showCount?: boolean
  onToggle?: (isFavorite: boolean) => void
}

export default function InstrumentedFavoriteButton(props: InstrumentedFavoriteButtonProps) {
  const { trackFavorite } = useAnalytics()

  const handleToggle = useCallback((isFavorite: boolean) => {
    // Track favorite action
    trackFavorite(
      isFavorite ? 'add' : 'remove',
      props.restaurantId,
      props.dishId
    )
    
    // Call original handler
    props.onToggle?.(isFavorite)
  }, [props.restaurantId, props.dishId, props.onToggle, trackFavorite])

  return (
    <FavoriteButton
      restaurantId={props.restaurantId || 0}
      favoritesCount={props.favoritesCount}
      savedFrom={props.savedFrom}
      size={props.size}
      className={props.className}
      onLoginRequired={props.onLoginRequired}
      showCount={props.showCount}
      data-analytics-restaurant-id={props.restaurantId}
      data-analytics-dish-id={props.dishId}
      data-analytics-action="favorite-toggle"
    />
  )
}
