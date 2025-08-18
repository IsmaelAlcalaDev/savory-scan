
import { useState, useCallback } from 'react';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';
import {
  ModernModal,
  ModernModalContent,
  ModernModalHeader,
  ModernModalBody,
  ModernModalTitle,
} from '@/components/ui/modern-modal';
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
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');

  const { suggestions, loading: loadingSuggestions } = useIntelligentLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory, getTopLocations } = useOptimizedLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();

  const topLocations = getTopLocations(3);

  const handleGPSLocation = useCallback(async () => {
    setIsLoadingGPS(true);
    setDetectedLocation('');
    
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
      
      onOpenChange(false);
    } catch (error: any) {
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

  return (
    <ModernModal open={open} onOpenChange={onOpenChange}>
      <ModernModalContent className="max-w-lg">
        <ModernModalHeader>
          <ModernModalTitle>¿Dónde hay que hacer la entrega?</ModernModalTitle>
        </ModernModalHeader>
        
        <ModernModalBody className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar dirección"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary bg-muted/30"
            />
          </div>

          {/* GPS Button */}
          <Button 
            variant="outline" 
            className="w-full justify-center gap-2 h-12 rounded-xl bg-primary/5 border-primary/20 text-primary hover:bg-primary/10" 
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
          >
            <Navigation className="h-4 w-4" />
            {isLoadingGPS ? 'Detectando ubicación...' : 'Utilizar la ubicación actual'}
          </Button>

          {/* Detected Location Display */}
          {detectedLocation && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground mb-1">Ubicación detectada:</p>
              <p className="text-sm font-medium text-primary">{detectedLocation}</p>
            </div>
          )}

          {/* Search Suggestions */}
          {searchQuery.length >= 2 && (
            <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
              <ScrollArea className="max-h-48">
                {loadingSuggestions ? (
                  <div className="p-3 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="p-2">
                    {suggestions.slice(0, 4).map((suggestion) => (
                      <Button
                        key={`${suggestion.type}-${suggestion.id}`}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50 rounded-lg"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {suggestion.name}
                              {suggestion.is_famous && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
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
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div>No se encontraron ubicaciones</div>
                    <div className="text-xs mt-1">
                      Intenta con otra palabra o revisa la ortografía
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Location History */}
          {history.length > 0 && searchQuery.length < 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Direcciones recientes
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground h-auto p-1"
                >
                  Limpiar
                </Button>
              </div>
              <div className="border border-border/50 rounded-xl bg-background overflow-hidden">
                <div className="p-2">
                  {topLocations.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50 rounded-lg"
                      onClick={() => handleHistorySelect(item)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1">
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
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ModernModalBody>
      </ModernModalContent>
    </ModernModal>
  );
}
