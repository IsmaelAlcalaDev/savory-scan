
import React from 'react';
import { MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onLocationClick,
  onMenuClick
}: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <button onClick={onLogoClick} className="flex items-center">
          <img 
            src={appLogoUrl}
            alt={`${appName} Logo`} 
            className="w-16 h-16 bg-transparent object-contain cursor-pointer"
          />
        </button>
      </div>

      {/* Location */}
      <div className="flex-1 flex justify-center px-4">
        <Button
          variant="ghost"
          onClick={onLocationClick}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-transparent max-w-48"
        >
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {isLoadingLocation ? 'Detectando...' : currentLocationName}
          </span>
        </Button>
      </div>

      {/* Menu */}
      <div className="flex items-center flex-shrink-0">
        <button 
          className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
