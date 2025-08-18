
import { useState, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OptimizedLocationDropdown from './OptimizedLocationDropdown';

interface OptimizedLocationSearchInputProps {
  placeholder?: string;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
  className?: string;
}

export default function OptimizedLocationSearchInput({
  placeholder = "¿Dónde buscas?",
  onLocationSelect,
  className = ""
}: OptimizedLocationSearchInputProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSearchClick = () => {
    setIsDropdownOpen(true);
  };

  const handleLocationSelect = (location: any) => {
    onLocationSelect(location);
    setIsDropdownOpen(false);
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        onClick={handleSearchClick}
        className="w-full justify-start gap-3 px-4 py-3 h-auto text-left border-2 border-border hover:border-red-500/30 transition-colors bg-background"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-normal">
          {placeholder}
        </span>
      </Button>

      {/* Optimized Dropdown */}
      <OptimizedLocationDropdown
        isOpen={isDropdownOpen}
        onClose={handleCloseDropdown}
        onLocationSelect={handleLocationSelect}
        triggerRef={triggerRef}
      />
    </div>
  );
}
