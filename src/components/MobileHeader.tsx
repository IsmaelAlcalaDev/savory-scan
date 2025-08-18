
import React from 'react';
import { MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedLocationSearchInput from './OptimizedLocationSearchInput';

interface MobileHeaderProps {
  appName: string;
  appLogoUrl: string;
  currentLocationName: string;
  isLoadingLocation: boolean;
  onLogoClick: () => void;
  onLocationClick: () => void;
  onMenuClick: () => void;
}

export default function MobileHeader({
  appName,
  appLogoUrl,
  currentLocationName,
  isLoadingLocation,
  onLogoClick,
  onMenuClick
}: MobileHeaderProps) {

  const handleLocationSelect = (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => {
    console.log('Location selected:', location);
    
    // Save the selected location in localStorage
    localStorage.setItem('selectedLocation', JSON.stringify({
      name: location.data?.name || location.data?.address || 'Ubicación seleccionada',
      latitude: location.data?.latitude,
      longitude: location.data?.longitude,
      type: location.data?.type,
      parent: location.data?.parent,
      address: location.data?.address || location.data?.name
    }));

    // Optionally reload the page to reflect the new location
    window.location.reload();
  };

  return (
    <div className="space-y-3 p-4">
      {/* Top row: Logo and Menu */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <button onClick={onLogoClick} className="flex items-center">
            <img 
              src={appLogoUrl} 
              alt={`${appName} Logo`} 
              className="w-12 h-12 bg-transparent object-contain cursor-pointer" 
            />
          </button>
        </div>

        {/* Current Location Display */}
        <div className="flex-1 flex justify-center px-4">
          <div className="flex items-center gap-2 text-sm text-black max-w-48">
            <MapPin className="h-4 w-4 flex-shrink-0 text-black" />
            <span className="truncate">
              {isLoadingLocation ? 'Detectando...' : currentLocationName}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="flex items-center flex-shrink-0">
          <button 
            className="p-1 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors" 
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <OptimizedLocationSearchInput
        placeholder="¿Dónde buscas?"
        onLocationSelect={handleLocationSelect}
        className="w-full"
      />
    </div>
  );
}
