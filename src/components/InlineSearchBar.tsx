import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

interface InlineSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function InlineSearchBar({ 
  searchQuery, 
  onSearchChange, 
  onSearchSubmit,
  placeholder = "Buscar restaurantes...",
  className = ""
}: InlineSearchBarProps) {
  const { trackSearch } = useAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim());
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      trackSearch(searchQuery.trim());
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 bg-gray-100 border-0 rounded-full text-gray-900 placeholder:text-gray-600 focus:bg-gray-100 focus:border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          data-analytics-element="search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            data-analytics-action="search-clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
