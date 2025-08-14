
import React from 'react';
import { Search, MapPin, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: TabletHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <button onClick={onLogoClick} className="flex items-center">
          <img 
            src={appLogoUrl}
            alt={`${appName} Logo`} 
            className="w-20 h-20 bg-transparent object-contain cursor-pointer"
          />
        </button>
      </div>

      {/* Center: Location and Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {/* Location */}
        <Button
          variant="ghost"
          onClick={onLocationClick}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-transparent whitespace-nowrap"
        >
          <MapPin className="h-4 w-4" />
          <span className="max-w-32 truncate">
            {isLoadingLocation ? 'Detectando...' : currentLocationName}
          </span>
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 z-10" style={{ color: '#4B4B4B' }} />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              className="pl-10 pr-4 h-10 text-base rounded-full border-0 placeholder:text-[#4B4B4B]"
              style={{ 
                backgroundColor: '#F3F3F3',
                color: '#4B4B4B'
              }}
            />
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-7 w-7" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
