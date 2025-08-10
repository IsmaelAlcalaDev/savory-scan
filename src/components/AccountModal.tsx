
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Heart, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileSection from './ProfileSection';
import FavoritesSection from './FavoritesSection';
import ReservationsSection from './ReservationsSection';
import SettingsSection from './SettingsSection';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState('profile');

  // Check if VEG mode is active from body class
  const isVegMode = typeof document !== 'undefined' && document.body.classList.contains('veg-mode');

  const tabs = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: User
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      icon: Heart
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: Calendar
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl max-h-[80vh] overflow-hidden transition-all duration-300",
        isVegMode ? "border-green-200" : "border-red-200"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "text-xl font-semibold transition-colors duration-300",
            isVegMode ? "text-green-700" : "text-red-700"
          )}>
            Mi Cuenta
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={cn(
            "grid w-full grid-cols-4 mb-6 transition-all duration-300",
            isVegMode 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          )}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-2 text-sm transition-all duration-300",
                    "data-[state=active]:shadow-sm",
                    isVegMode
                      ? "data-[state=active]:bg-green-100 data-[state=active]:text-green-700 hover:bg-green-50 hover:text-green-600"
                      : "data-[state=active]:bg-red-100 data-[state=active]:text-red-700 hover:bg-red-50 hover:text-red-600"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    activeTab === tab.id 
                      ? (isVegMode ? "text-green-600" : "text-red-600")
                      : "text-muted-foreground"
                  )} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            <TabsContent value="profile" className="space-y-4">
              <ProfileSection />
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <FavoritesSection />
            </TabsContent>

            <TabsContent value="reservations" className="space-y-4">
              <ReservationsSection />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsSection />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
