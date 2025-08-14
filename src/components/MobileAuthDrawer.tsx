
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

interface MobileAuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function MobileAuthDrawer({ 
  isOpen, 
  onClose, 
  title = "Inicia sesión para continuar",
  description = "Accede con tu cuenta de Google para guardar favoritos y personalizar tu experiencia"
}: MobileAuthDrawerProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        toast({
          title: "Error al iniciar sesión",
          description: error.message || "No se pudo iniciar sesión con Google",
          variant: "destructive"
        });
      } else {
        // El drawer se cerrará automáticamente cuando el usuario se autentique
        onClose();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="mx-auto w-full max-w-sm">
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <DrawerHeader className="px-6 pb-6 text-center">
          <DrawerTitle className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-gray-600 text-sm leading-relaxed">
            {description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-8 space-y-4">
          {/* Google Sign In Button - Estilo nativo móvil */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-14 bg-white border border-gray-300 rounded-xl flex items-center justify-center gap-4 hover:bg-gray-50 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
            ) : (
              <>
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-800 font-medium text-base">
                  {isLoading ? 'Iniciando sesión...' : 'Continuar con Google'}
                </span>
              </>
            )}
          </button>

          {/* Mensaje informativo */}
          <p className="text-xs text-gray-500 text-center px-4">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
