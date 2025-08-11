
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';

interface FavoriteButtonProps {
  restaurantId: number;
  favoritesCount: number;
  savedFrom?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onLoginRequired?: () => void;
}

export default function FavoriteButton({
  restaurantId,
  favoritesCount,
  savedFrom = 'button',
  size = 'md',
  className,
  onLoginRequired,
}: FavoriteButtonProps) {
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLoginRequired = () => {
    if (onLoginRequired) onLoginRequired();
  };

  const handleToggle = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Evitar navegación/click del contenedor (cards, links, etc.)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isToggling(restaurantId)) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Call toggle; do not touch local counts here
    await toggleFavorite(restaurantId, savedFrom, handleLoginRequired);
  };

  const liked = isFavorite(restaurantId);
  const loading = isToggling(restaurantId);

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 transition-colors",
        "bg-background hover:bg-accent text-foreground",
        loading && "opacity-70 cursor-not-allowed",
        isAnimating && "scale-95",
        className
      )}
      aria-pressed={liked}
      aria-label={liked ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin", size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4")} />
      ) : (
        <Heart
          className={cn(
            liked ? "fill-red-500 stroke-red-500" : "stroke-current",
            size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
          )}
        />
      )}
      <span
        className={cn(
          "font-medium text-gray-700",
          size === 'sm' ? "text-xs" : size === 'lg' ? "text-sm" : "text-xs"
        )}
      >
        {Math.max(0, favoritesCount)}
      </span>
    </button>
  );
}
