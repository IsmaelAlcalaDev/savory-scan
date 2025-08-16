
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
    <div className="flex items-center justify-between py-1.5 px-4 lg:py-2 xl:py-2.5">
      {/* Left Section: Logo - Responsive sizing */}
      <div className="flex items-center flex-shrink-0 relative">
        <button onClick={onLogoClick} className="flex items-center">
          <img 
            src={appLogoUrl}
            alt={`${appName} Logo`} 
            className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-transparent object-contain absolute top-1/2 left-0 transform -translate-y-1/2 z-10 cursor-pointer"
          />
        </button>
        {/* Spacer to maintain layout - responsive */}
        <div className="w-12 h-4 lg:w-14 xl:w-16" />
      </div>

      {/* Center Section: Location and Search */}
      <div className="flex items-center gap-3 lg:gap-4 xl:gap-6 flex-1 justify-center max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-6 lg:mx-8 xl:mx-12">
        {/* Location Section */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={onLocationClick}
            className="flex items-center gap-2 text-xs lg:text-sm xl:text-sm text-black hover:text-black hover:bg-transparent whitespace-nowrap h-7 lg:h-8 xl:h-9 px-2"
          >
            <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-black" />
            <span className="max-w-32 lg:max-w-36 xl:max-w-40 truncate">
              {isLoadingLocation ? 'Detectando...' : currentLocationName}
            </span>
          </Button>
        </div>

        {/* Search Section */}
        <div className="flex-1 max-w-sm lg:max-w-md xl:max-w-lg">
          <div className="relative">
            <Search className="absolute left-2 lg:left-3 top-1/2 h-3 w-3 lg:h-4 lg:w-4 -translate-y-1/2 z-10 text-black" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              onBlur={onSearchBlur}
              className="pl-8 lg:pl-10 pr-3 lg:pr-4 h-7 lg:h-8 xl:h-9 text-xs lg:text-sm rounded-full border-0 text-black placeholder:text-black focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              style={{ 
                backgroundColor: 'rgb(243, 243, 243)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Section: Menu */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button 
          className="p-1 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
