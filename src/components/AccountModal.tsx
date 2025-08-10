
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className={cn(
            "text-xl font-semibold transition-colors duration-300",
            isVegMode ? "text-green-700" : "text-red-700"
          )}>
            Mi Cuenta
          </DialogTitle>
        </DialogHeader>
        
        <div className="w-full">
          <div className="flex w-full border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 relative flex-1",
                    "border-b-2 border-transparent",
                    isActive
                      ? isVegMode
                        ? "bg-green-600 text-white border-b-green-600"
                        : "bg-red-600 text-white border-b-red-600"
                      : cn(
                          "text-gray-600 hover:text-white rounded-t-lg",
                          isVegMode
                            ? "hover:bg-green-400"
                            : "hover:bg-red-400"
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

          <div className="overflow-y-auto max-h-[calc(80vh-140px)] p-6">
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'favorites' && <FavoritesSection />}
            {activeTab === 'reservations' && <ReservationsSection />}
            {activeTab === 'settings' && <SettingsSection />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
