
import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InlineSearchBar from './InlineSearchBar';

interface MobileHeaderProps {
  currentLocationName: string;
  isLoadingLocation: boolean;
  onLocationClick: () => void;
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function MobileHeader({
  currentLocationName,
  isLoadingLocation,
  onLocationClick,
  onMenuClick,
  searchQuery,
  onSearchChange
}: MobileHeaderProps) {
  return (
    <div className="md:hidden">
      {/* Top row: Search bar centered, menu on right */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <InlineSearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Buscar restaurantes, cocinas..."
          />
        </div>
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

      {/* Menu */}
      <div className="flex items-center flex-shrink-0">
        <button className="p-0 border-0 bg-transparent text-gray-800 transition-colors" onClick={onMenuClick}>
          <Menu className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
