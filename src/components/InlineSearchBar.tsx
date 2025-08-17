
import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface InlineSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  restaurantName: string;
  restaurantLogo?: string;
  onGoBack: () => void;
  onSearchToggle: () => void;
}

export default function InlineSearchBar({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  placeholder = "Buscar platos...",
  restaurantName,
  restaurantLogo,
  onGoBack,
  onSearchToggle
}: InlineSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (isOpen) {
    return (
      <div className="animate-fade-in bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full border-0 bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal header when search is not active
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onGoBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {restaurantLogo && (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0">
                <img src={restaurantLogo} alt={`${restaurantName} logo`} className="w-full h-full object-cover" />
              </div>
            )}
            
            <h1 className="text-lg font-bold">
              {restaurantName}
            </h1>
          </div>

          <button
            onClick={onSearchToggle}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Buscar platos"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
