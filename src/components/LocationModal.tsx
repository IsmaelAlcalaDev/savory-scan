import { useState } from 'react';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { Skeleton } from '@/components/ui/skeleton';
import LocationInfo from './LocationInfo';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
}

export default function LocationModal({ open, onOpenChange, onLocationSelect }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState<any>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const { suggestions, loading: loadingSuggestions } = useLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory } = useLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { reverseGeocode } = useReverseGeocoding();

  const handleGPSLocation = async () => {
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
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('GPS coordinates obtained:', { latitude, longitude });
      
      // Obtener información de geocodificación inversa
      const geocodeResult = await reverseGeocode(latitude, longitude);
      
      // Encontrar la ubicación más cercana en la base de datos
      const nearestLocation = await findNearestLocation(latitude, longitude);
      
      let displayName = 'Ubicación detectada';
      
      if (nearestLocation) {
        // Usar solo el nombre del lugar más específico
        displayName = nearestLocation.name;
      } else if (geocodeResult) {
        // Usar la ubicación local específica del geocoding
        displayName = geocodeResult.localArea;
      }
      
      setDetectedLocation(displayName);
      
      onLocationSelect({
        type: 'gps',
        data: {
          latitude,
          longitude,
          name: nearestLocation?.name || displayName,
          type: nearestLocation?.type,
          parent: nearestLocation?.parent,
          address: displayName
        }
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
  };

  const handleSuggestionSelect = (suggestion: any) => {
    // Add to history
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
        address: suggestion.name // Usar solo el nombre específico
      }
    });
    onOpenChange(false);
  };

  const handleHistorySelect = (item: any) => {
    onLocationSelect({
      type: 'suggestion',
      data: {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        type: item.type,
        parent: item.parent,
        address: item.name // Usar solo el nombre específico
      }
    });
    onOpenChange(false);
  };

  const showInfo = (location: any) => {
    if (location.type === 'poi' && location.description) {
      setShowLocationInfo(location);
    }
  };

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

          {/* Suggestions */}
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
                            <div className="font-medium">{suggestion.name}</div>
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
                    No se encontraron ubicaciones
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
                    {history.map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 hover:bg-muted/50"
                        onClick={() => handleHistorySelect(item)}
                      >
                        <div className="w-full">
                          <div className="font-medium">{item.name}</div>
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
