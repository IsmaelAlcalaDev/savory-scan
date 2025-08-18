
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

  // Limit suggestions to maximum 6 results
  const limitedSuggestions = useMemo(() => suggestions.slice(0, 6), [suggestions]);

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
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  }, [showSuggestions]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 border-0 text-white">
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

          {/* Search Input with GPS Button - No rounded borders */}
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
                className="pl-12 pr-16 h-14 bg-white/95 backdrop-blur-sm border-0 shadow-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 text-lg"
                style={{ borderRadius: '0px' }}
                maxLength={50}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-3 bg-primary text-white hover:bg-primary/80 transition-colors"
                style={{ borderRadius: '0px' }}
                onClick={handleGPSLocation}
                disabled={isLoadingGPS}
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Modern Dropdown - Always positioned correctly */}
            {showSuggestions && (
              <div 
                className="absolute top-full left-0 right-0 mt-1 bg-white/98 backdrop-blur-sm border-0 shadow-2xl z-50 max-h-[60vh] overflow-hidden"
                style={{ 
                  borderRadius: '0px',
                  transform: 'translateZ(0)', // Force hardware acceleration
                  willChange: 'transform, opacity'
                }}
              >
                <ScrollArea className="max-h-[60vh]">
                  <div className="p-0">
                    {/* GPS Option - always show first */}
                    <button
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center gap-3 group"
                      onClick={handleGPSLocation}
                      disabled={isLoadingGPS}
                    >
                      <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                        <Navigation className="h-4 w-4 text-primary flex-shrink-0" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-base">
                          {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Encuentra restaurantes cerca de ti automáticamente
                        </div>
                      </div>
                    </button>

                    {/* Search Results - Maximum 6 results */}
                    {searchQuery.length >= 2 && (
                      <>
                        {loadingSuggestions ? (
                          <div className="p-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : limitedSuggestions.length > 0 ? (
                          <>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Resultados ({limitedSuggestions.length})
                              </div>
                            </div>
                            {limitedSuggestions.map((suggestion) => (
                              <button
                                key={`${suggestion.type}-${suggestion.id}`}
                                className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center gap-3 group border-b border-gray-50"
                                onClick={() => handleSuggestionSelect(suggestion)}
                              >
                                <div className="bg-green-50 p-2 rounded-full group-hover:bg-green-100 transition-colors">
                                  <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                                    {suggestion.name}
                                    {suggestion.is_famous && (
                                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                        ⭐ Famoso
                                      </span>
                                    )}
                                  </div>
                                  {suggestion.parent && (
                                    <div className="text-sm text-gray-500 truncate mt-1">
                                      {suggestion.parent}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </>
                        ) : (
                          <div className="p-6 text-center border-b border-gray-100">
                            <div className="text-gray-900 font-medium text-base mb-1">No se encontraron ubicaciones</div>
                            <div className="text-sm text-gray-500">
                              Intenta con una palabra diferente
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Location History - Always show, even when empty or searching */}
                    <div className="bg-gray-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 uppercase tracking-wide">
                          <Clock className="h-4 w-4" />
                          Ubicaciones recientes
                        </h4>
                        {topLocations.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="text-xs text-gray-400 hover:text-gray-600 h-auto p-1"
                          >
                            Limpiar
                          </Button>
                        )}
                      </div>
                      
                      {topLocations.length > 0 ? (
                        <>
                          {topLocations.map((item) => (
                            <button
                              key={item.id}
                              className="w-full text-left p-4 hover:bg-gray-100 transition-colors flex items-center gap-3 group border-b border-gray-100 last:border-b-0"
                              onClick={() => handleHistorySelect(item)}
                            >
                              <div className="bg-blue-50 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 flex items-center gap-2 text-base">
                                  {item.name}
                                  {item.usage_count > 1 && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium flex-shrink-0">
                                      {item.usage_count}x
                                    </span>
                                  )}
                                </div>
                                {item.parent && (
                                  <div className="text-sm text-gray-500 truncate mt-1">
                                    {item.parent}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="p-6 text-center">
                          <div className="text-gray-500 text-sm">
                            No hay ubicaciones recientes
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Tus búsquedas aparecerán aquí
                          </div>
                        </div>
                      )}
                    </div>
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
