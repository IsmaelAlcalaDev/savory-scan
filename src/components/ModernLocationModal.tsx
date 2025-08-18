import { useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Navigation, Clock, ChevronDown, X } from 'lucide-react';
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
      <DialogContent className="w-full max-w-md mx-auto p-0 gap-0 bg-background border-border shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Seleccionar ubicación
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Encuentra restaurantes cerca de ti
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Detected Location Display */}
          {detectedLocation && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Ubicación detectada:
              </p>
              <p className="text-sm font-medium text-foreground">
                {detectedLocation}
              </p>
            </div>
          )}

          {/* Search Dropdown */}
          <div className="space-y-3">
            <Popover open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
              <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                  <div className="flex items-center border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex-1 flex items-center gap-3 px-4 py-3">
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Buscar ubicación..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground"
                        maxLength={50}
                      />
                    </div>
                    <div className="px-4">
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>
              </PopoverTrigger>

              <PopoverContent 
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border shadow-lg max-h-80"
                align="start"
                sideOffset={4}
              >
                {/* GPS Option */}
                <div className="p-2 border-b border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-3 h-auto text-left hover:bg-muted/80"
                    onClick={handleGPSLocation}
                    disabled={isLoadingGPS}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Navigation className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">
                        {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Detecta automáticamente donde estás
                      </div>
                    </div>
                  </Button>
                </div>

                <ScrollArea className="max-h-64">
                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <div>
                      <div className="px-3 py-2 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Search className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Sugerencias
                          </span>
                          {!loadingSuggestions && limitedSuggestions.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({limitedSuggestions.length})
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {loadingSuggestions ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="flex items-center gap-3 p-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1 flex-1">
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
                                className="w-full justify-start gap-3 p-2 h-auto text-left hover:bg-muted/80"
                                onClick={() => handleSuggestionSelect(suggestion)}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground flex items-center gap-2">
                                    {suggestion.name}
                                    {suggestion.is_famous && (
                                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                                        ⭐
                                      </span>
                                    )}
                                  </div>
                                  {suggestion.parent && (
                                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                                      {suggestion.parent}
                                    </div>
                                  )}
                                </div>
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <div className="text-sm font-medium text-foreground mb-1">
                              No se encontraron ubicaciones
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Intenta con otra palabra
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* History Section */}
                  {topLocations.length > 0 && (
                    <div className={searchQuery.length >= 2 ? 'border-t border-border' : ''}>
                      <div className="px-3 py-2 bg-muted/30 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Recientes
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({topLocations.length})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
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
                              className="w-full justify-start gap-3 p-2 h-auto text-left hover:bg-muted/80"
                              onClick={() => handleHistorySelect(item)}
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
                                <Clock className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground flex items-center gap-2">
                                  {item.name}
                                  {item.usage_count > 1 && (
                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                                      {item.usage_count}x
                                    </span>
                                  )}
                                </div>
                                {item.parent && (
                                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                                    {item.parent}
                                  </div>
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty History State */}
                  {topLocations.length === 0 && searchQuery.length < 2 && (
                    <div className="py-6 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
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

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Selecciona una ubicación para encontrar restaurantes cerca
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
