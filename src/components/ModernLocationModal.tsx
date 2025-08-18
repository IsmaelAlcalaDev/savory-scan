
import { useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Navigation, Clock, X, Utensils } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntelligentLocationSuggestions } from '@/hooks/useIntelligentLocationSuggestions';
import { useOptimizedLocationHistory } from '@/hooks/useOptimizedLocationHistory';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';

interface ModernLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
}

export default function ModernLocationModal({ 
  open, 
  onOpenChange, 
  onLocationSelect 
}: ModernLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');

  const { suggestions, loading: loadingSuggestions } = useIntelligentLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory, getTopLocations } = useOptimizedLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();

  // Get top 5 locations for history
  const topLocations = useMemo(() => getTopLocations(5), [getTopLocations]);

  const handleGPSLocation = useCallback(async () => {
    setIsLoadingGPS(true);
    setDetectedLocation('');
    
    try {
      console.log('Requesting geolocation permission...');
      
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
      
      // Run geocoding and nearest location search in parallel
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

      // Add to history if we have a proper location
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
      
      onOpenChange(false);
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
  }, [reverseGeocode, findNearestLocation, addToHistory, onLocationSelect, onOpenChange]);

  const handleSuggestionSelect = useCallback((suggestion: any) => {
    // Add to history with optimized tracking
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
    onOpenChange(false);
  }, [addToHistory, onLocationSelect, onOpenChange]);

  const handleHistorySelect = useCallback((item: any) => {
    // This will increment usage count automatically
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
    onOpenChange(false);
  }, [addToHistory, onLocationSelect, onOpenChange]);

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden bg-primary border-0 text-white">
        <DialogHeader className="space-y-6 pb-0">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
            <div className="bg-white/20 p-3 rounded-full">
              <Utensils className="h-8 w-8 text-white" />
            </div>
            <span>Seleccionar Ubicación</span>
          </DialogTitle>
          
          <div className="text-center space-y-2">
            <p className="text-white/90 text-lg font-medium">
              🍽️ ¿Dónde quieres explorar?
            </p>
            <p className="text-white/70 text-sm">
              Encuentra los mejores restaurantes cerca de ti
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Detected Location Display */}
          {detectedLocation && (
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <p className="text-white/70 text-sm mb-1">Ubicación detectada:</p>
              <p className="text-white font-medium">{detectedLocation}</p>
            </div>
          )}

          {/* Search Input with GPS Button */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="pl-12 pr-16 h-14 bg-white/95 backdrop-blur-sm border-0 shadow-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 rounded-full text-lg"
                maxLength={50}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors"
                onClick={handleGPSLocation}
                disabled={isLoadingGPS}
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchQuery.length >= 2 || topLocations.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-float z-50 max-h-80 overflow-hidden">
                <ScrollArea className="max-h-80">
                  <div className="p-2">
                    {/* GPS Option - always show when suggestions are open */}
                    <button
                      className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors border-b border-gray-200 flex items-center gap-3"
                      onClick={handleGPSLocation}
                      disabled={isLoadingGPS}
                    >
                      <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="font-medium text-gray-900">
                        {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                      </div>
                    </button>

                    {/* Search Results */}
                    {searchQuery.length >= 2 && (
                      <>
                        {loadingSuggestions ? (
                          <div className="p-3 space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        ) : suggestions.length > 0 ? (
                          <>
                            {suggestions.map((suggestion) => (
                              <button
                                key={`${suggestion.type}-${suggestion.id}`}
                                className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-3"
                                onClick={() => handleSuggestionSelect(suggestion)}
                              >
                                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 flex items-center gap-2">
                                    {suggestion.name}
                                    {suggestion.is_famous && (
                                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex-shrink-0">
                                        ⭐ Famoso
                                      </span>
                                    )}
                                  </div>
                                  {suggestion.parent && (
                                    <div className="text-sm text-gray-500 truncate">
                                      {suggestion.parent}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            <div className="text-sm">No se encontraron ubicaciones</div>
                            <div className="text-xs text-gray-400 mt-1">
                              Intenta con una palabra diferente
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Location History - show only when not searching */}
                    {searchQuery.length < 2 && topLocations.length > 0 && (
                      <>
                        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 mt-2">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recientes
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="text-xs text-gray-400 hover:text-gray-600 h-auto p-1"
                          >
                            Limpiar
                          </Button>
                        </div>
                        {topLocations.map((item) => (
                          <button
                            key={item.id}
                            className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-3"
                            onClick={() => handleHistorySelect(item)}
                          >
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {item.name}
                                {item.usage_count > 1 && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                                    {item.usage_count}x
                                  </span>
                                )}
                              </div>
                              {item.parent && (
                                <div className="text-sm text-gray-500 truncate">
                                  {item.parent}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-white/60 text-sm">
              💡 Selecciona una ubicación para encontrar restaurantes increíbles
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
