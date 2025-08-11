
import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import AuthModal from './AuthModal';

interface FavoriteButtonProps {
  restaurantId: number;
  favoritesCount: number;
  onLoginRequired?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({
  restaurantId,
  favoritesCount,
  onLoginRequired,
  className,
  size = 'md'
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, isToggling, toggleFavorite } = useFavorites();
  const [localCount, setLocalCount] = useState(favoritesCount);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLoginRequired = () => {
    if (onLoginRequired) {
      onLoginRequired();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // PASO 2: VERIFICACIÓN DE AUTENTICACIÓN
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
    
    // Optimistic update del contador
    setLocalCount(prev => previousState ? prev - 1 : prev + 1);
    
    try {
      const result = await toggleFavorite(restaurantId, handleLoginRequired);
      
      // Actualizar contador basado en el resultado real
      if (result !== previousState) {
        setLocalCount(prev => result ? prev + 1 : prev - 1);
      }
    } catch (error) {
      // Revertir optimistic update en caso de error
      setLocalCount(favoritesCount);
    }
  };

  const isLoading = isToggling(restaurantId);
  const isFav = isFavorite(restaurantId);

  // Estados visuales según autenticación
  const getHeartStyle = () => {
    if (!user) {
      // Gris: Usuario no logueado
      return "text-gray-400";
    }
    
    if (isFav) {
      // Rojo lleno: Usuario logueado, en favoritos
      return "text-red-500 fill-red-500";
    }
    
    // Rojo vacío: Usuario logueado, no en favoritos
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
              isLoading && "animate-pulse"
            )} 
          />
        )}
        <span className={cn(
          "font-medium text-gray-700",
          size === 'sm' ? "text-xs" : size === 'lg' ? "text-sm" : "text-xs"
        )}>
          {localCount}
        </span>
      </button>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}
