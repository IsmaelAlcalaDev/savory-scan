
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { useAuthModal } from '@/hooks/useAuthModal';
import MobileAuthDrawer from './MobileAuthDrawer';
import AuthModal from './AuthModal';

interface FavoriteButtonProps {
  restaurantId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  favoritesCount?: number;
  savedFrom?: string;
  onLoginRequired?: () => void;
}

export default function FavoriteButton({ 
  restaurantId, 
  className = '',
  size = 'md',
  savedFrom = 'button',
  onLoginRequired
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isToggling } = useFavorites();
  const { requireAuth, isAuthDrawerOpen, closeAuthDrawer, authContext, isAuthenticated, isMobile } = useMobileAuth();
  const { isOpen: isAuthModalOpen, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthModal();
  
  const isRestaurantFavorite = isFavorite(restaurantId);
  const isLoading = isToggling(restaurantId);

  const handleFavoriteToggle = () => {
    const action = async () => {
      await toggleFavorite(restaurantId, savedFrom, onLoginRequired);
    };

    requireAuth(action, {
      title: "Guarda tus favoritos",
      description: "Inicia sesión para guardar este restaurante en tus favoritos y acceder a ellos desde cualquier dispositivo"
    });

    // Para desktop, abrir modal si no está autenticado
    if (!isAuthenticated && !isMobile) {
      openAuthModal();
    }
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5', 
    lg: 'h-6 w-6'
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavoriteToggle}
        disabled={isLoading}
        className={`${sizeClasses[size]} rounded-full bg-white/90 hover:bg-white shadow-lg transition-all duration-200 ${className}`}
        aria-label={isRestaurantFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart 
          className={`${iconSizes[size]} transition-colors duration-200 ${
            isRestaurantFavorite 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      </Button>

      {/* Mobile Auth Drawer */}
      <MobileAuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={closeAuthDrawer}
        title={authContext.title}
        description={authContext.description}
      />

      {/* Desktop Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </>
  );
}
