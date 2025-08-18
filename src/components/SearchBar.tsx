
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useSecureInput } from '@/hooks/useSecureInput';

interface SearchBarProps {
  onSearch: (query: string, location?: string) => void;
  placeholder?: string;
  defaultQuery?: string;
  defaultLocation?: string;
  showLocationFilter?: boolean;
  className?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search restaurants, cuisines, dishes...",
  defaultQuery = "",
  defaultLocation = "",
  showLocationFilter = true,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultLocation);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, loading } = useLocationSuggestions(location);
  const { sanitizeText, sanitizeSearchQuery } = useSecureInput();
  
  useBodyScrollLock(showLocationDropdown);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQueryChange = (value: string) => {
    // Sanitize input using the correct method
    const sanitized = sanitizeText(value);
    if (sanitized && sanitized.length <= 100) {
      setQuery(sanitized);
    }
  };

  const handleLocationChange = (value: string) => {
    // Sanitize location input using the correct method
    const sanitized = sanitizeText(value);
    if (sanitized && sanitized.length <= 50) {
      setLocation(sanitized);
      setShowLocationDropdown(value.length > 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Final sanitization before search using search-specific sanitizer
    const safeQuery = sanitizeSearchQuery(query);
    const safeLocation = sanitizeText(location);
    onSearch(safeQuery, safeLocation);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    const sanitized = sanitizeText(selectedLocation);
    setLocation(sanitized);
    setShowLocationDropdown(false);
    locationInputRef.current?.blur();
  };

  const clearLocation = () => {
    setLocation("");
    setShowLocationDropdown(false);
  };

  const handleLocationFocus = () => {
    setIsFocused(true);
    if (location.length > 0) {
      setShowLocationDropdown(true);
    }
  };

  const handleLocationBlur = () => {
    setIsFocused(false);
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowLocationDropdown(false);
      }
    }, 150);
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        {/* Search Query Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pl-10 h-10 bg-background/95 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
              maxLength={100}
            />
          </div>
        </div>

        {/* Location Filter */}
        {showLocationFilter && (
          <div className="relative md:w-64" ref={dropdownRef}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                ref={locationInputRef}
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={handleLocationFocus}
                onBlur={handleLocationBlur}
                className="pl-10 pr-8 h-10 bg-background/95 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                maxLength={50}
              />
              {location && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm border border-border/50 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {loading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Searching locations...
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion.name)}
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{suggestion.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search Button */}
        <Button 
          type="submit" 
          size="lg" 
          className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          disabled={!query.trim()}
        >
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </form>

      {/* Active Filters */}
      {(query || location) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              {query}
              <button
                onClick={() => setQuery("")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {location}
              <button
                onClick={clearLocation}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
