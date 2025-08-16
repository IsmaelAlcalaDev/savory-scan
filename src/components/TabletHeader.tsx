
import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InlineSearchBar from './InlineSearchBar';

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
  onSearchChange: (query: string) => void;
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
  onLogoClick,
  onLocationClick,
  onMenuClick,
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: TabletHeaderProps) {
  return (
    <div className="hidden md:flex lg:hidden items-center gap-4">
      <button onClick={onLogoClick} className="flex items-center gap-2 flex-shrink-0">
        <img src={appLogoUrl} alt={`${appName} logo`} className="h-8 w-8 rounded-full" />
        <h1 className="text-xl font-bold text-foreground whitespace-nowrap">{appName}</h1>
      </button>
      
      <div className="flex-1 max-w-md">
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
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onLocationClick}
          className="flex items-center gap-2 text-sm text-black whitespace-nowrap"
        >
          <MapPin className="h-4 w-4 text-black" />
          <span className="max-w-32 truncate">
            {isLoadingLocation ? 'Detectando...' : currentLocationName}
          </span>
        </Button>
        
        <button
          className="p-0 border-0 bg-transparent text-gray-800 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
