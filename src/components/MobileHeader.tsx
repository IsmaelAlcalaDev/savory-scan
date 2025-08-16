
import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InlineSearchBar from './InlineSearchBar';

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
    <div className="md:hidden">
      {/* Top row: Logo and menu */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onLogoClick} className="flex items-center gap-2">
          <img src={appLogoUrl} alt={`${appName} logo`} className="h-8 w-8 rounded-full" />
          <h1 className="text-xl font-bold text-foreground">{appName}</h1>
        </button>
        
        <button className="p-0 border-0 bg-transparent text-gray-800 transition-colors" onClick={onMenuClick}>
          <Menu className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>

      {/* Location */}
      <div className="flex-1 flex justify-center px-4">
        <Button variant="ghost" onClick={onLocationClick} className="flex items-center gap-2 text-sm text-black max-w-48">
          <MapPin className="h-4 w-4 flex-shrink-0 text-black" />
          <span className="truncate">
            {isLoadingLocation ? 'Detectando...' : currentLocationName}
          </span>
        </Button>
      </div>
    </div>
  );
}
