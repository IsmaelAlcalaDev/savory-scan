
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ModernModal,
  ModernModalContent,
  ModernModalHeader,
  ModernModalBody,
  ModernModalTitle,
} from '@/components/ui/modern-modal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  User, 
  LogOut, 
  ArrowLeft,
  Settings,
  Heart,
  Calendar,
  ChevronRight,
  MapPin
} from 'lucide-react';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import ReservationsSection from './ReservationsSection';
import SettingsSection from './SettingsSection';

interface ModernProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProfileSection = 'main' | 'profile' | 'favorites' | 'reservations' | 'settings';

export default function ModernProfileModal({ open, onOpenChange }: ModernProfileModalProps) {
  const { user, signOut } = useAuth();
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
    <div className="space-y-0 px-0 pb-0">
      {/* Header */}
      <div className="px-6 py-4 bg-primary/5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Mi Cuenta</h2>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.email || 'Usuario'}
            </p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="shrink-0 rounded-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <ScrollArea className="max-h-80">
        <div className="space-y-0">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full text-left px-6 py-4 hover:bg-muted/30 transition-colors ${
                  index < menuItems.length - 1 ? 'border-b border-border/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${item.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer info */}
      <div className="px-6 py-4 border-t border-border/30 bg-muted/10">
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
      <div className="space-y-0 px-0 pb-0">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-border/30 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToMain}
              className="shrink-0 rounded-full"
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
        </div>

        {/* Section Content */}
        <ScrollArea className="max-h-80">
          <div className="px-6 py-4">
            {currentSection === 'profile' && <ProfileSection />}
            {currentSection === 'favorites' && <FavoritesSection />}
            {currentSection === 'reservations' && <ReservationsSection />}
            {currentSection === 'settings' && <SettingsSection />}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <ModernModal open={open} onOpenChange={onOpenChange}>
      <ModernModalContent className="max-w-lg">
        <ModernModalHeader>
          <ModernModalTitle>
            {currentSection === 'main' ? 'Mi Perfil' : menuItems.find(item => item.id === currentSection)?.title}
          </ModernModalTitle>
        </ModernModalHeader>
        
        <ModernModalBody>
          {currentSection === 'main' ? renderMainMenu() : renderSection()}
        </ModernModalBody>
      </ModernModalContent>
    </ModernModal>
  );
}
