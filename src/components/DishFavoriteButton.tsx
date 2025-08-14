
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDishFavorites } from '@/contexts/DishFavoritesContext';

interface DishFavoriteButtonProps {
  dishId: number;
  favoritesCount: number;
  savedFrom?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onLoginRequired?: () => void;
  showCount?: boolean;
}

export default function DishFavoriteButton({
  dishId,
  favoritesCount,
  savedFrom = 'button',
  size = 'md',
  className,
  onLoginRequired,
  showCount = false,
}: DishFavoriteButtonProps) {
  const { isDishFavorite, isToggling, toggleDishFavorite } = useDishFavorites();
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

    if (isToggling(dishId)) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    // Call toggle; do not touch local counts here
    await toggleDishFavorite(dishId, savedFrom, handleLoginRequired);
  };

  const liked = isDishFavorite(dishId);
  const loading = isToggling(dishId);

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-6 w-6';
      default: return 'h-5 w-5';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      default: return 'w-10 h-10';
    }
  };

  if (showCount) {
    // Version with counter
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
          <Loader2 className={cn("animate-spin", getIconSize())} />
        ) : (
          <Heart
            className={cn(
              liked ? "fill-red-500 stroke-red-500" : "stroke-current",
              getIconSize()
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

  // Circular version without counter
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        "rounded-full border bg-background hover:bg-accent text-foreground transition-colors",
        "flex items-center justify-center",
        loading && "opacity-70 cursor-not-allowed",
        isAnimating && "scale-95",
        getButtonSize(),
        className
      )}
      aria-pressed={liked}
      aria-label={liked ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin", getIconSize())} />
      ) : (
        <Heart
          className={cn(
            liked ? "fill-red-500 stroke-red-500" : "stroke-current",
            getIconSize()
          )}
        />
      )}
    </button>
  );
}
