
import React, { useState, useCallback, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSecureInput } from '@/hooks/useSecureInput';
import { toast } from '@/hooks/use-toast';

interface SecureSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export default function SecureSearchBar({ 
  onSearch, 
  placeholder = "Search restaurants...",
  className = "",
  maxLength = 100 
}: SecureSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { sanitizeSearchQuery, createRateLimiter } = useSecureInput();

  // Rate limiter: max 10 searches per minute
  const searchRateLimiter = useMemo(() => 
    createRateLimiter(10, 60 * 1000), [createRateLimiter]
  );

  const handleSearch = useCallback(async (searchQuery: string) => {
    // Rate limiting check
    const clientId = 'search_' + (navigator.userAgent || 'anonymous');
    if (!searchRateLimiter(clientId)) {
      toast({
        title: "Too many searches",
        description: "Please wait a moment before searching again",
        variant: "destructive"
      });
      return;
    }

    const sanitizedQuery = sanitizeSearchQuery(searchQuery.trim());
    
    if (!sanitizedQuery) {
      return;
    }

    if (sanitizedQuery.length < 2) {
      toast({
        title: "Search too short",
        description: "Please enter at least 2 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    try {
      await onSearch(sanitizedQuery);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [onSearch, sanitizeSearchQuery, searchRateLimiter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Limit input length
    if (value.length <= maxLength) {
      setQuery(value);
      
      // Auto-search with debouncing for better UX
      if (value.trim().length >= 2) {
        const timeoutId = setTimeout(() => {
          handleSearch(value);
        }, 500);
        
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch(''); // Reset search results
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isSearching}
          className="pl-10 pr-20"
          maxLength={maxLength}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {isSearching && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
        </div>
      </div>
      
      {/* Hidden submit button for accessibility */}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}
