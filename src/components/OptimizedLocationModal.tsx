
import { useState, useCallback, useMemo } from 'react';
import { Search, MapPin, Navigation, Clock, X } from 'lucide-react';
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
import LocationInfo from './LocationInfo';

interface OptimizedLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
}

export default function OptimizedLocationModal({ 
  open, 
  onOpenChange, 
  onLocationSelect 
}: OptimizedLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState<any>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');

  const { suggestions, loading: loadingSuggestions } = useIntelligentLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory, getTopLocations } = useOptimizedLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();

  // Memoized top locations for better performance
  const topLocations = useMemo(() => getTopLocations(3), [getTopLocations]);

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
            maximumAge: 60000 // Cache for 1 minute
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

  const showInfo = useCallback((location: any) => {
    if (location.type === 'poi' && location.description) {
      setShowLocationInfo(location);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar Ubicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* GPS Button */}
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2" 
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
          >
            <Navigation className="h-4 w-4" />
            {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
          </Button>

          {/* Detected Location Display */}
          {detectedLocation && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Ubicación detectada:</p>
              <p className="text-sm font-medium">{detectedLocation}</p>
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Info Popup */}
            {showLocationInfo && (
              <LocationInfo
                location={showLocationInfo}
                onClose={() => setShowLocationInfo(null)}
              />
            )}
          </div>

          {/* Search Suggestions */}
          {searchQuery.length >= 2 && (
            <div className="border rounded-md bg-background max-h-48 overflow-hidden">
              <ScrollArea className="max-h-48">
                {loadingSuggestions ? (
                  <div className="p-2 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="p-1">
                    {suggestions.map((suggestion) => (
                      <div key={`${suggestion.type}-${suggestion.id}`} className="flex">
                        <Button
                          variant="ghost"
                          className="flex-1 justify-start text-left h-auto p-3 hover:bg-muted/50"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <div className="w-full">
                            <div className="font-medium flex items-center gap-2">
                              {suggestion.name}
                              {suggestion.is_famous && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  ⭐
                                </span>
                              )}
                            </div>
                            {suggestion.parent && (
                              <div className="text-xs text-muted-foreground">
                                {suggestion.parent}
                              </div>
                            )}
                          </div>
                        </Button>
                        {suggestion.type === 'poi' && suggestion.description && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2"
                            onClick={() => showInfo(suggestion)}
                          >
                            <div className="w-4 h-4 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                              i
                            </div>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <div>No se encontraron ubicaciones</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Intenta con otra palabra o revisa la ortografía
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Location History */}
          {history.length > 0 && searchQuery.length < 2 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Ubicaciones recientes
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </Button>
              </div>
              <div className="border rounded-md bg-background max-h-40 overflow-hidden">
                <ScrollArea className="max-h-40">
                  <div className="p-1">
                    {topLocations.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                        onClick={() => handleHistorySelect(item)}
                      >
                        <div className="w-full">
                          <div className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.usage_count > 1 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {item.usage_count}x
                              </span>
                            )}
                          </div>
                          {item.parent && (
                            <div className="text-xs text-muted-foreground">
                              {item.parent}
                            </div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
