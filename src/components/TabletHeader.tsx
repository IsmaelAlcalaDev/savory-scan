
import React, { useState } from 'react';
import { Search, MapPin, Menu, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import ModernLocationModal from './ModernLocationModal';

interface TabletHeaderProps {
  appName: string;
  appLogoUrl: string;
  currentLocationName: string;
  isLoadingLocation: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  isSearchFocused: boolean;
  onLogoClick: () => void;
  onLocationClick: () => void;
  onMenuClick: () => void;
  onAccountClick: () => void;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
}

export default function TabletHeader({
  appName,
  appLogoUrl,
  currentLocationName,
  isLoadingLocation,
  searchQuery,
  searchPlaceholder,
  isSearchFocused,
  onLogoClick,
  onLocationClick,
  onMenuClick,
  onAccountClick,
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: TabletHeaderProps) {
  const { user } = useAuth();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const handleLocationButtonClick = () => {
    setIsLocationModalOpen(true);
    // También llamar al callback original si es necesario
    onLocationClick();
  };

  const handleLocationSelect = (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => {
    console.log('Location selected:', location);
    // Aquí puedes manejar la selección de ubicación
    // Por ejemplo, actualizar el estado global de ubicación
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between py-1 px-6 gap-2">
        {/* Logo - Smaller size */}
        <div className="flex items-center flex-shrink-0">
          <button onClick={onLogoClick} className="flex items-center">
            <img 
              src={appLogoUrl}
              alt={`${appName} Logo`} 
              className="w-14 h-14 bg-transparent object-contain cursor-pointer"
            />
          </button>
        </div>

        {/* Center: Location and Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          {/* Location */}
          <Button
            variant="ghost"
            onClick={handleLocationButtonClick}
            className="flex items-center gap-2 text-sm text-black hover:text-black hover:bg-transparent whitespace-nowrap h-8 px-2"
          >
            <MapPin className="h-4 w-4 text-black" />
            <span className="max-w-32 truncate">
              {isLoadingLocation ? 'Detectando...' : currentLocationName}
            </span>
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 z-10 text-black" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                className="pl-10 pr-4 h-8 text-sm rounded-full border-0 text-black placeholder:text-black focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                style={{ 
                  backgroundColor: 'rgb(243, 243, 243)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Account and Menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Account Section */}
          {user ? (
            <button
              onClick={onAccountClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user.user_metadata?.avatar_url} 
                  alt="Profile" 
                />
                <AvatarFallback className="text-sm font-medium bg-gray-200 text-gray-700">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <Button
              onClick={onAccountClick}
              className="bg-black text-white hover:bg-gray-800 text-sm px-4 py-2 h-8 rounded-full transition-colors"
            >
              Registrarse
            </Button>
          )}

          {/* Menu */}
          <button 
            className="p-1 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Modern Location Modal */}
      <ModernLocationModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}
