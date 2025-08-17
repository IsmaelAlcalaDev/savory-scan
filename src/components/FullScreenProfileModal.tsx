
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  LogOut, 
  ArrowLeft,
  Settings,
  Heart,
  Calendar,
  ChevronRight
} from 'lucide-react';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import ReservationsSection from './ReservationsSection';
import SettingsSection from './SettingsSection';

interface FullScreenProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProfileSection = 'main' | 'profile' | 'favorites' | 'reservations' | 'settings';

export default function FullScreenProfileModal({ open, onOpenChange }: FullScreenProfileModalProps) {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [currentSection, setCurrentSection] = useState<ProfileSection>('main');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  const handleBackToMain = () => {
    setCurrentSection('main');
  };

  const menuItems = [
    {
      id: 'profile' as ProfileSection,
      title: 'Mi Perfil',
      description: 'Información personal y datos de contacto',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 'favorites' as ProfileSection,
      title: 'Favoritos',
      description: 'Restaurantes y platos guardados',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: 'reservations' as ProfileSection,
      title: 'Reservas',
      description: 'Historial de reservaciones',
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 'settings' as ProfileSection,
      title: 'Configuración',
      description: 'Preferencias y ajustes de la cuenta',
      icon: Settings,
      color: 'text-gray-600'
    }
  ];

  const renderMainMenu = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.email || 'Usuario'}
          </p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="shrink-0"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </Button>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-6">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors ${item.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-6 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            FoodieSpot v1.0 • Miembro desde {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    const currentItem = menuItems.find(item => item.id === currentSection);
    
    return (
      <div className="flex flex-col h-full">
        {/* Section Header */}
        <div className="flex items-center gap-4 p-6 border-b bg-white sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMain}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            {currentItem && (
              <div className={`p-2 rounded-lg bg-gray-50 ${currentItem.color}`}>
                <currentItem.icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentItem?.title}
              </h2>
              <p className="text-sm text-gray-600">
                {currentItem?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentSection === 'profile' && <ProfileSection />}
            {currentSection === 'favorites' && <FavoritesSection />}
            {currentSection === 'reservations' && <ReservationsSection />}
            {currentSection === 'settings' && <SettingsSection />}
          </div>
        </div>
      </div>
    );
  };

  const content = currentSection === 'main' ? renderMainMenu() : renderSection();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-full w-full max-w-none p-0 rounded-none"
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-full h-screen w-screen p-0 rounded-none">
        {content}
      </DialogContent>
    </Dialog>
  );
}
