import { useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Navigation, Clock, ChevronDown, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      
      setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
    onOpenChange(false);
  }, [addToHistory, onLocationSelect, onOpenChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    setIsDropdownOpen(open);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto bg-background border-border shadow-xl rounded-xl overflow-hidden">
        {/* Modern Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Seleccionar ubicación
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Encuentra restaurantes cerca de ti
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Search Information Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Puedes buscar por:</p>
                <p className="text-blue-700">
                  Ciudad • Municipio • Distrito • Barrio • Código Postal • Punto de interés
                </p>
              </div>
            </div>
          </div>

          {/* Detected Location Display */}
          {detectedLocation && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
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

          {/* Search Dropdown */}
          <div className="space-y-2">
            <Popover open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <div className="flex items-center border-2 border-border rounded-xl bg-background hover:border-primary/30 transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar ubicación..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground font-medium"
                        maxLength={50}
                      />
                    </div>
                    <div className="px-4 border-l border-border/50">
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border-2 border-border shadow-2xl rounded-xl overflow-hidden max-h-96"
                align="start"
                sideOffset={8}
              >
                <ScrollArea className="max-h-96">
                  {/* GPS Option */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border/30">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-white/80 rounded-lg transition-all duration-200 hover:shadow-sm"
                      onClick={handleGPSLocation}
                      disabled={isLoadingGPS}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
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
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <>
                      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-border/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Search className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold text-green-800">
                              Sugerencias
                            </span>
                            {!loadingSuggestions && limitedSuggestions.length > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                {limitedSuggestions.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {loadingSuggestions ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-3 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
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
                                className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-green-50 rounded-lg transition-all duration-200 group"
                                onClick={() => handleSuggestionSelect(suggestion)}
                              >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                                  <MapPin className="h-5 w-5 text-green-600" />
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
                          <div className="py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <Search className="h-6 w-6 text-gray-400" />
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
                              Historial reciente
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              {topLocations.length}
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
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                <Clock className="h-5 w-5 text-purple-600" />
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

                  {/* Empty History State */}
                  {topLocations.length === 0 && searchQuery.length < 2 && (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        No hay ubicaciones recientes
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tus búsquedas aparecerán aquí
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
