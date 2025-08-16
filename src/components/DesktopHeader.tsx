
import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InlineSearchBar from './InlineSearchBar';

interface DesktopHeaderProps {
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
  onSearchChange: (query: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
}

export default function DesktopHeader({
  appName,
  appLogoUrl,
  currentLocationName,
  isLoadingLocation,
  searchQuery,
  searchPlaceholder,
  onLogoClick,
  onLocationClick,
  onMenuClick,
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: DesktopHeaderProps) {
  return (
    <div className="hidden lg:flex items-center justify-between gap-8">
      <div className="flex items-center gap-6">
        <button onClick={onLogoClick} className="flex items-center gap-2">
          <img src={appLogoUrl} alt={`${appName} logo`} className="h-10 w-10 rounded-full" />
          <h1 className="text-2xl font-bold text-foreground">
            {appName}
          </h1>
        </button>
        
        <div className="w-80">
          <InlineSearchBar
            isOpen={false}
            onClose={() => {}}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            placeholder={searchPlaceholder}
            restaurantName=""
            onGoBack={() => {}}
            onSearchToggle={() => {}}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          onClick={onLocationClick}
          className="flex items-center gap-2 text-sm text-black whitespace-nowrap"
        >
          <MapPin className="h-4 w-4 text-black" />
          <span className="max-w-40 truncate">
            {isLoadingLocation ? 'Detectando...' : currentLocationName}
          </span>
        </Button>
        
        <button
          className="p-0 border-0 bg-transparent text-gray-800 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-9 w-9" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
