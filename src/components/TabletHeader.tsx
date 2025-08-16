
import React from 'react';
import { Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InlineSearchBar from './InlineSearchBar';

interface TabletHeaderProps {
  currentLocationName: string;
  isLoadingLocation: boolean;
  onLocationClick: () => void;
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function TabletHeader({
  currentLocationName,
  isLoadingLocation,
  onLocationClick,
  onMenuClick,
  searchQuery,
  onSearchChange
}: TabletHeaderProps) {
  return (
    <div className="hidden md:flex lg:hidden items-center gap-4">
      <div className="flex-1 max-w-md">
        <InlineSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Buscar restaurantes, cocinas..."
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
