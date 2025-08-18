
import { useState, useRef, useCallback } from 'react';
import { Search, MapPin, Navigation, X, AlertCircle } from 'lucide-react';
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

const getLocationTypeIcon = (type: string) => {
  switch (type) {
    case 'city':
      return '🏙️';
    case 'municipality':
      return '🏘️';
    case 'district':
      return '🏛️';
    case 'neighborhood':
      return '🏠';
    case 'postal_code':
      return '📮';
    case 'poi':
      return '📍';
    default:
      return '📍';
  }
};

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
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`pl-12 pr-12 h-14 bg-white/95 backdrop-blur-sm border-0 shadow-card text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 rounded-full transition-all ${
            showError ? 'ring-2 ring-red-500/50' : ''
          } ${selectedLocation ? 'ring-2 ring-green-500/50' : ''}`}
          maxLength={100}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-red-50/95 backdrop-blur-sm border border-red-200 rounded-lg shadow-float z-40">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Debes seleccionar una ubicación de la lista</span>
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-float z-50 max-h-80 overflow-hidden">
          <ScrollArea className="max-h-80">
            <div className="p-2">
              {/* GPS Option - always first */}
              <button
                className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200"
                onClick={handleGPSLocation}
                disabled={isLoadingGPS}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <Navigation className="h-5 w-5 text-primary" />
                  <div className="font-medium text-gray-900">
                    {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                  </div>
                </div>
              </button>

              {/* Search suggestions */}
              {searchQuery.length >= 2 && (
                <>
                  {loading ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-md" />
                      ))}
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-1">
                      {suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.type}-${suggestion.id}`}
                          className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => handleLocationSelect(suggestion)}
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl mt-0.5">
                              {getLocationTypeIcon(suggestion.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {suggestion.name}
                                </div>
                                {suggestion.is_famous && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                    ⭐ Famoso
                                  </span>
                                )}
                                {suggestion.similarity_score && suggestion.similarity_score < 0.7 && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                    ¿Buscabas esto?
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                                  {getLocationTypeLabel(suggestion.type)}
                                </span>
                                {suggestion.parent && (
                                  <span className="truncate">{suggestion.parent}</span>
                                )}
                                {suggestion.postal_code && (
                                  <span>CP: {suggestion.postal_code}</span>
                                )}
                              </div>
                              {suggestion.description && (
                                <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                  {suggestion.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : hasSearched ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <div className="font-medium text-sm mb-1">No encontramos esa ubicación</div>
                      <div className="text-xs text-gray-400">
                        Intenta con el nombre de una ciudad, municipio, distrito o código postal
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {/* Initial state when no query */}
              {!searchQuery && (
                <div className="p-6 text-center text-gray-500">
                  <div className="text-4xl mb-2">📍</div>
                  <div className="font-medium text-sm mb-1">Busca tu ubicación</div>
                  <div className="text-xs text-gray-400">
                    Escribe ciudad, municipio, distrito, barrio o código postal
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
