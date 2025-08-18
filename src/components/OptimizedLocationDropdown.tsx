
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Navigation, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntelligentLocationSuggestions } from '@/hooks/useIntelligentLocationSuggestions';
import { useOptimizedLocationHistory } from '@/hooks/useOptimizedLocationHistory';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';

interface OptimizedLocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export default function OptimizedLocationDropdown({ 
  isOpen, 
  onClose, 
  onLocationSelect,
  triggerRef 
}: OptimizedLocationDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { suggestions, loading: loadingSuggestions } = useIntelligentLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory, getTopLocations } = useOptimizedLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();

  // Get top 3 locations for compact history
  const topLocations = useMemo(() => getTopLocations(3), [getTopLocations]);

  // Limit suggestions to maximum 4 results for dropdown
  const limitedSuggestions = useMemo(() => suggestions.slice(0, 4), [suggestions]);

  // Auto-focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleGPSLocation = useCallback(async () => {
    setIsLoadingGPS(true);
    setDetectedLocation('');
    
    try {
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
      
      const [geocodeResult, nearestLocation] = await Promise.all([
        reverseGeocode(latitude, longitude),
        findNearestLocation(latitude, longitude)
      ]);
      
      let displayName = 'Ubicación detectada';
      
      if (nearestLocation) {
        displayName = nearestLocation.name;
      } else if (geocodeResult) {
        displayName = geocodeResult.localArea;
      }
      
      setDetectedLocation(displayName);
      
      const locationData = {
        latitude,
        longitude,
        name: nearestLocation?.name || displayName,
        type: nearestLocation?.type || 'manual' as const,
        parent: nearestLocation?.parent,
        address: displayName
      };

      if (nearestLocation) {
        addToHistory({
          name: nearestLocation.name,
          type: nearestLocation.type,
          latitude,
          longitude,
          parent: nearestLocation.parent
        });
      }
      
      onLocationSelect({
        type: 'gps',
        data: locationData
      });
      
      onClose();
    } catch (error: any) {
      console.error('GPS Error:', error);
      let errorMessage = 'Error al obtener ubicación';
      if (error.code === 1) {
        errorMessage = 'Permiso de ubicación denegado';
      } else if (error.code === 2) {
        errorMessage = 'Ubicación no disponible';
      } else if (error.code === 3) {
        errorMessage = 'Tiempo de espera agotado';
      }
      setDetectedLocation(errorMessage);
    } finally {
      setIsLoadingGPS(false);
    }
  }, [reverseGeocode, findNearestLocation, addToHistory, onLocationSelect, onClose]);

  const handleSuggestionSelect = useCallback((suggestion: any) => {
    addToHistory({
      name: suggestion.name,
      type: suggestion.type,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      parent: suggestion.parent
    });

    onLocationSelect({
      type: 'suggestion',
      data: {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        type: suggestion.type,
        parent: suggestion.parent,
        address: suggestion.name
      }
    });
    onClose();
  }, [addToHistory, onLocationSelect, onClose]);

  const handleHistorySelect = useCallback((item: any) => {
    addToHistory({
      name: item.name,
      type: item.type,
      latitude: item.latitude,
      longitude: item.longitude,
      parent: item.parent
    });

    onLocationSelect({
      type: 'suggestion',
      data: {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        type: item.type,
        parent: item.parent,
        address: item.name
      }
    });
    onClose();
  }, [addToHistory, onLocationSelect, onClose]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-background border-2 border-border shadow-2xl rounded-xl overflow-hidden max-h-96 z-50"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-border/30">
        <div className="relative">
          <div className="flex items-center border-2 border-border rounded-xl bg-background hover:border-red-500/30 transition-all duration-200 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={handleInputChange}
                className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground font-medium"
                maxLength={50}
              />
            </div>
            <div className="px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-80">
        {/* GPS Option */}
        <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border-b border-border/30">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-white/80 rounded-lg transition-all duration-200 hover:shadow-sm"
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-md">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground mb-0.5">
                {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
              </div>
              <div className="text-xs text-muted-foreground">
                Detecta automáticamente donde estás
              </div>
            </div>
            {isLoadingGPS && (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </Button>
        </div>

        {/* Detected Location Display */}
        {detectedLocation && (
          <div className="p-3 bg-emerald-50 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-xs font-medium text-emerald-800 mb-0.5">
                  Ubicación detectada:
                </p>
                <p className="text-sm font-semibold text-emerald-900">
                  {detectedLocation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <>
            <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <Search className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-red-800">
                  Sugerencias
                </span>
                {!loadingSuggestions && limitedSuggestions.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    {limitedSuggestions.length}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-2">
              {loadingSuggestions ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : limitedSuggestions.length > 0 ? (
                <div className="space-y-1">
                  {limitedSuggestions.map((suggestion) => (
                    <Button
                      key={`${suggestion.type}-${suggestion.id}`}
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-red-50 rounded-lg transition-all duration-200 group"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                        <MapPin className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-0.5">
                          {suggestion.name}
                          {suggestion.is_famous && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
                              ⭐
                            </span>
                          )}
                        </div>
                        {suggestion.parent && (
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.parent}
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    No se encontraron ubicaciones
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intenta con otra palabra clave
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* History Section */}
        {topLocations.length > 0 && (
          <>
            <div className={`px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 ${searchQuery.length >= 2 ? 'border-t border-border/30' : ''} border-b border-border/30`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <Clock className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold text-purple-800">
                    Recientes
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground h-auto px-2 py-1 rounded-md hover:bg-white/80"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            
            <div className="p-2">
              <div className="space-y-1">
                {topLocations.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-purple-50 rounded-lg transition-all duration-200 group"
                    onClick={() => handleHistorySelect(item)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2 mb-0.5">
                        {item.name}
                        {item.usage_count > 1 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            {item.usage_count}x
                          </span>
                        )}
                      </div>
                      {item.parent && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.parent}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}
