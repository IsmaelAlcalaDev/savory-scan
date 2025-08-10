
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
          <div className="border-b border-gray-200">
            <div className="flex w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 relative",
                      "border-b-2 border-transparent hover:border-opacity-50",
                      isActive
                        ? isVegMode
                          ? "bg-green-600 text-white border-b-green-600"
                          : "bg-red-600 text-white border-b-red-600"
                        : cn(
                            "text-gray-600 hover:text-white",
                            isVegMode
                              ? "hover:bg-green-400 hover:border-b-green-400"
                              : "hover:bg-red-400 hover:border-b-red-400"
                          )
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      isActive 
                        ? "text-white"
                        : "text-gray-500"
                    )} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(80vh-120px)] mt-6">
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
