
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, LogOut } from 'lucide-react';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import ReservationsSection from './ReservationsSection';
import SettingsSection from './SettingsSection';

interface AccountProfileViewProps {
  onClose: () => void;
}

export default function AccountProfileView({ onClose }: AccountProfileViewProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente"
      });
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="ml-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </DialogTitle>
        <DialogDescription>
          Gestiona tu perfil, favoritos y configuración
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <FavoritesSection />
        </TabsContent>

        <TabsContent value="reservations" className="mt-6">
          <ReservationsSection />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsSection />
        </TabsContent>
      </Tabs>
    </>
  );
}
