
import { useState, useRef, useCallback } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useEnhancedLocationSearch } from '@/hooks/useEnhancedLocationSearch';
import { useNearestLocation } from '@/hooks/useNearestLocation';

interface LocationOption {
  id: number;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'neighborhood' | 'postal_code' | 'poi';
  latitude: number;
  longitude: number;
  parent?: string;
  description?: string;
  is_famous?: boolean;
  postal_code?: string;
  similarity_score?: number;
}

interface LocationSearchInputProps {
  onLocationSelect: (location: LocationOption) => void;
  placeholder?: string;
  className?: string;
}

const getLocationTypeLabel = (type: string) => {
  switch (type) {
    case 'city':
      return 'Ciudad';
    case 'municipality':
      return 'Municipio';
    case 'district':
      return 'Distrito';
    case 'neighborhood':
      return 'Barrio';
    case 'postal_code':
      return 'Código Postal';
    case 'poi':
      return 'Punto de Interés';
    default:
      return 'Ubicación';
  }
};

export default function LocationSearchInput({ 
  onLocationSelect, 
  placeholder = "Buscar ciudad, municipio, distrito, barrio...",
  className = ""
}: LocationSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [showError, setShowError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { suggestions, loading, hasSearched } = useEnhancedLocationSearch(searchQuery);
  const { findNearestLocation } = useNearestLocation();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    setShowError(false);
    setSelectedLocation(null);
  }, []);

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
    setShowError(false);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      // Show error if user typed but didn't select
      if (searchQuery && !selectedLocation && hasSearched) {
        setShowError(true);
      }
    }, 200);
  }, [searchQuery, selectedLocation, hasSearched]);

  const handleLocationSelect = useCallback((location: LocationOption) => {
    setSelectedLocation(location);
    setSearchQuery(location.parent ? `${location.name}, ${location.parent}` : location.name);
    setShowSuggestions(false);
    setShowError(false);
    onLocationSelect(location);
  }, [onLocationSelect]);

  const handleGPSLocation = useCallback(async () => {
    setIsLoadingGPS(true);
    setShowSuggestions(false);
    setShowError(false);
    
    try {
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocalización no soportada en este navegador');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('GPS coordinates obtained:', { latitude, longitude });
      
      const nearestLocation = await findNearestLocation(latitude, longitude);
      
      if (nearestLocation) {
        const gpsLocation: LocationOption = {
          id: nearestLocation.id,
          name: nearestLocation.name,
          type: nearestLocation.type as LocationOption['type'],
          latitude,
          longitude,
          parent: nearestLocation.parent
        };
        handleLocationSelect(gpsLocation);
      } else {
        setShowError(true);
        console.error('No se encontró una ubicación cercana en nuestra base de datos');
      }
    } catch (error: any) {
      console.error('GPS Error:', error);
      setShowError(true);
    } finally {
      setIsLoadingGPS(false);
    }
  }, [findNearestLocation, handleLocationSelect]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedLocation(null);
    setShowSuggestions(false);
    setShowError(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input field - consistent design always */}
      <div className={`relative bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${
        selectedLocation ? 'border-green-500 ring-2 ring-green-500/20' : ''
      } ${showError ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="px-4 pr-12 h-12 bg-transparent border-0 text-base placeholder:text-gray-500 focus:ring-0 focus:outline-none"
          maxLength={100}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modern dropdown - appears below input without affecting it */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg z-50 max-h-80 overflow-hidden animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <ScrollArea className="max-h-80">
            {/* GPS Option - always first */}
            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
              onClick={handleGPSLocation}
              disabled={isLoadingGPS}
              type="button"
            >
              <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Encuentra restaurantes cerca de ti automáticamente
              </div>
            </button>

            {/* Search suggestions */}
            {searchQuery.length >= 2 && (
              <>
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors group"
                        onClick={() => handleLocationSelect(suggestion)}
                        type="button"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                              {suggestion.name}
                            </div>
                            {suggestion.is_famous && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 font-medium">
                                Famoso
                              </span>
                            )}
                            {suggestion.similarity_score && suggestion.similarity_score < 0.7 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">
                                ¿Buscabas esto?
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs font-medium">
                              {getLocationTypeLabel(suggestion.type)}
                            </span>
                            {suggestion.parent && (
                              <span>{suggestion.parent}</span>
                            )}
                            {suggestion.postal_code && (
                              <span>CP: {suggestion.postal_code}</span>
                            )}
                          </div>
                          {suggestion.description && (
                            <div className="text-sm text-gray-400 line-clamp-1">
                              {suggestion.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : hasSearched ? (
                  <div className="p-6 text-center">
                    <div className="text-gray-900 font-medium mb-1">No encontramos esa ubicación</div>
                    <div className="text-sm text-gray-500">
                      Intenta con el nombre de una ciudad, municipio, distrito o código postal
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {/* Initial state when no query */}
            {!searchQuery && (
              <div className="p-6 text-center">
                <div className="text-gray-900 font-medium mb-1">Busca tu ubicación</div>
                <div className="text-sm text-gray-500">
                  Escribe ciudad, municipio, distrito, barrio o código postal
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Error message - positioned below everything */}
      {showError && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 shadow-sm z-40">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Debes seleccionar una ubicación de la lista</span>
          </div>
        </div>
      )}
    </div>
  );
}
