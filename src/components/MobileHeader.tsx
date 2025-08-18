
import React, { useState } from 'react';
import { MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GuidedLocationModal from './GuidedLocationModal';

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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleLocationButtonClick = () => {
    setIsLocationModalOpen(true);
  };

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

    // Close modal
    setIsLocationModalOpen(false);
    
    // Optionally reload the page to reflect the new location
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between py-1 px-4">
        {/* Logo - Smaller size */}
        <div className="flex items-center flex-shrink-0">
          <button onClick={onLogoClick} className="flex items-center">
            <img 
              src={appLogoUrl} 
              alt={`${appName} Logo`} 
              className="w-12 h-12 bg-transparent object-contain cursor-pointer" 
            />
          </button>
        </div>

        {/* Location */}
        <div className="flex-1 flex justify-center px-4">
          <Button 
            variant="ghost" 
            onClick={handleLocationButtonClick} 
            className="flex items-center gap-2 text-sm text-black hover:text-black hover:bg-transparent max-w-48 h-8 px-2"
          >
            <MapPin className="h-4 w-4 flex-shrink-0 text-black" />
            <span className="truncate">
              {isLoadingLocation ? 'Detectando...' : currentLocationName}
            </span>
          </Button>
        </div>

        {/* Menu */}
        <div className="flex items-center flex-shrink-0">
          <button className="p-1 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors" onClick={onMenuClick}>
            <Menu className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Guided Location Modal */}
      <GuidedLocationModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}
