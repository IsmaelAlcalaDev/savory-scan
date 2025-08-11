
import { useState, useEffect, useCallback } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import AuthModal from './AuthModal';

interface FavoriteButtonProps {
  restaurantId: number;
  favoritesCount: number;
  onLoginRequired?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  savedFrom?: string;
}

export default function FavoriteButton({
  restaurantId,
  favoritesCount,
  onLoginRequired,
  className,
  size = 'md',
  savedFrom = 'button'
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const [localCount, setLocalCount] = useState(favoritesCount);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync local count with prop changes
  useEffect(() => {
    setLocalCount(favoritesCount);
  }, [favoritesCount]);

  // Listen for external favorite changes with debounce
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId: eventRestaurantId, isFavorite: eventIsFavorite } = event.detail;
      
      if (eventRestaurantId === restaurantId) {
        // Clear existing timer
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        // Debounce the update to prevent rapid changes
        debounceTimer = setTimeout(() => {
          setLocalCount(prev => {
            const currentIsFavorite = isFavorite(restaurantId);
            
            // Sync with the actual favorite state
            if (currentIsFavorite !== eventIsFavorite) {
              return Math.max(0, eventIsFavorite ? prev + 1 : prev - 1);
            }
            return prev;
          });
        }, 100);
      }
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
    
    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [restaurantId, isFavorite]);

  const handleLoginRequired = () => {
    if (onLoginRequired) {
      onLoginRequired();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Check authentication
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar restaurantes favoritos",
        variant: "destructive"
      });
      handleLoginRequired();
      return;
    }

    const previousState = isFavorite(restaurantId);
    
    // Animate heart
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    // NO optimistic update here - let the context handle it
    
    try {
      const result = await toggleFavorite(restaurantId, savedFrom, handleLoginRequired);
      
      // Only update if there was actually a change
      if (result !== previousState) {
        setLocalCount(prev => Math.max(0, result ? prev + 1 : prev - 1));
      }
    } catch (error) {
      // No need to revert since we didn't do optimistic update
      console.error('Error toggling favorite:', error);
    }
  };

  const isLoading = isToggling(restaurantId);
  const isFav = isFavorite(restaurantId);

  // Visual states based on authentication
  const getHeartStyle = () => {
    if (!user) {
      // Gray: User not logged in
      return "text-gray-400";
    }
    
    if (isFav) {
      // Red filled: User logged in, favorited
      return "text-red-500 fill-red-500";
    }
    
    // Red empty: User logged in, not favorited
    return "text-red-500";
  };

  const getTooltipText = () => {
    if (!user) return "Inicia sesión para guardar";
    return isFav ? "Quitar de favoritos" : "Guardar restaurante";
  };

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const paddingClasses = {
    sm: "px-1.5 py-1",
    md: "px-2 py-1",
    lg: "px-2.5 py-1.5"
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={getTooltipText()}
        className={cn(
          "flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full border border-white/20",
          "hover:bg-white transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-red-500/20",
          paddingClasses[size],
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        ) : (
          <Heart 
            className={cn(
              "transition-all duration-200",
              sizeClasses[size],
              getHeartStyle(),
              isLoading && "animate-pulse",
              isAnimating && "animate-pulse scale-125"
            )} 
          />
        )}
        <span className={cn(
          "font-medium text-gray-700",
          size === 'sm' ? "text-xs" : size === 'lg' ? "text-sm" : "text-xs"
        )}>
          {Math.max(0, localCount)}
        </span>
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
