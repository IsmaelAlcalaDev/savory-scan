
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';

export const useMobileAuth = () => {
  const [isAuthDrawerOpen, setIsAuthDrawerOpen] = useState(false);
  const [authContext, setAuthContext] = useState<{
    title?: string;
    description?: string;
  }>({});
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const requireAuth = (action: () => void, context?: {
    title?: string;
    description?: string;
  }) => {
    if (user) {
      // Usuario ya autenticado, ejecutar acción
      action();
    } else {
      // Usuario no autenticado
      if (isMobile) {
        // En móvil, mostrar drawer
        setAuthContext(context || {});
        setIsAuthDrawerOpen(true);
      } else {
        // En desktop, ejecutar acción original (que mostrará modal)
        action();
      }
    }
  };

  const closeAuthDrawer = () => {
    setIsAuthDrawerOpen(false);
    setAuthContext({});
  };

  return {
    isAuthDrawerOpen,
    authContext,
    requireAuth,
    closeAuthDrawer,
    isMobile,
    isAuthenticated: !!user
  };
};
