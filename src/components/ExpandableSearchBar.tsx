
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExpandableSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function ExpandableSearchBar({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  placeholder = "Buscar platos..."
}: ExpandableSearchBarProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg z-50 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 bg-gray-100 border-0 rounded-full text-gray-900 placeholder:text-gray-600 focus:bg-gray-100 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <button
            onClick={onClose}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
