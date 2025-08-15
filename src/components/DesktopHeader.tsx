
import React from 'react';
import { Search, MapPin, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  onSearchChange: (value: string) => void;
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
  isSearchFocused,
  onLogoClick,
  onLocationClick,
  onMenuClick,
  onSearchChange,
  onSearchFocus,
  onSearchBlur
}: DesktopHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      {/* Left Section: Logo - Increased size */}
      <div className="flex items-center flex-shrink-0 relative">
        <button onClick={onLogoClick} className="flex items-center">
          <img 
            src={appLogoUrl}
            alt={`${appName} Logo`} 
            className="w-28 h-28 bg-transparent object-contain absolute top-1/2 left-0 transform -translate-y-1/2 z-10 cursor-pointer"
          />
        </button>
        {/* Spacer to maintain layout */}
        <div className="w-28 h-8" />
      </div>

      {/* Center Section: Location and Search */}
      <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-8">
        {/* Location Section */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={onLocationClick}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-transparent whitespace-nowrap"
          >
            <MapPin className="h-4 w-4" />
            <span className="max-w-40 truncate">
              {isLoadingLocation ? 'Detectando...' : currentLocationName}
            </span>
          </Button>
        </div>

        {/* Search Section */}
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

      {/* Right Section: Menu */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
