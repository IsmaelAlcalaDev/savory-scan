
import { useState } from 'react';
import { MapPin, Navigation, Search, Star, Building, MapPinIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCities } from '@/hooks/useCities';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => void;
}

const getLocationIcon = (type: string, is_famous?: boolean) => {
  switch (type) {
    case 'city':
      return <Building className="h-4 w-4 text-blue-500" />;
    case 'district':
      return is_famous ? <Star className="h-4 w-4 text-yellow-500" /> : <MapPinIcon className="h-4 w-4 text-green-500" />;
    case 'municipality':
      return <MapPinIcon className="h-4 w-4 text-purple-500" />;
    case 'poi':
      return <MapPin className="h-4 w-4 text-red-500" />;
    default:
      return <MapPin className="h-4 w-4" />;
  }
};

const getLocationTypeLabel = (type: string, is_famous?: boolean) => {
  switch (type) {
    case 'city':
      return 'Ciudad';
    case 'district':
      return is_famous ? 'Barrio famoso' : 'Distrito';
    case 'municipality':
      return 'Municipio';
    case 'poi':
      return 'Punto de interés';
    default:
      return type;
  }
};

export default function LocationModal({ open, onOpenChange, onLocationSelect }: LocationModalProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const { cities, loading: loadingCities } = useCities();
  const { suggestions, loading: loadingSuggestions } = useLocationSuggestions(manualLocation);

  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            onLocationSelect({
              type: 'gps',
              data: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            });
            onOpenChange(false);
            setIsLoadingGPS(false);
          },
          (error) => {
            console.error('GPS Error:', error);
            setIsLoadingGPS(false);
          }
        );
      }
    } catch (error) {
      console.error('GPS Error:', error);
      setIsLoadingGPS(false);
    }
  };

  const handleManualLocation = () => {
    if (manualLocation.trim()) {
      onLocationSelect({
        type: 'manual',
        data: { query: manualLocation }
      });
      onOpenChange(false);
    }
  };

  const handleCitySelect = (city: any) => {
    onLocationSelect({
      type: 'city',
      data: {
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude
      }
    });
    onOpenChange(false);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    onLocationSelect({
      type: 'suggestion',
      data: {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        type: suggestion.type,
        parent: suggestion.parent
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Seleccionar Ubicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* GPS Option */}
          <Card className="bg-glass border-glass">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Navigation className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">Usar mi ubicación actual</h3>
                  <p className="text-sm text-muted-foreground">
                    Detectaremos automáticamente tu ubicación usando GPS
                  </p>
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={handleGPSLocation}
                    disabled={isLoadingGPS}
                  >
                    {isLoadingGPS ? 'Detectando...' : 'Detectar Ubicación'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Search with Suggestions */}
          <Card className="bg-glass border-glass">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">Buscar ubicación</h3>
                  <p className="text-sm text-muted-foreground">
                    Busca ciudades, barrios, distritos o puntos de interés
                  </p>
                  <div className="space-y-2">
                    <Input
                      placeholder="Ej: Centro, Sevilla, Museo del Prado..."
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                      className="bg-background/50 border-glass"
                    />
                    
                    {/* Suggestions */}
                    {manualLocation.length >= 2 && (
                      <div className="border border-glass rounded-md bg-background/30 max-h-40 overflow-hidden">
                        <ScrollArea className="max-h-40">
                          {loadingSuggestions ? (
                            <div className="p-2 space-y-2">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-full" />
                              ))}
                            </div>
                          ) : suggestions.length > 0 ? (
                            <div className="p-1">
                              {suggestions.map((suggestion) => (
                                <Button
                                  key={`${suggestion.type}-${suggestion.id}`}
                                  variant="ghost"
                                  className="w-full justify-start text-left h-auto p-2 hover:bg-primary/10"
                                  onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                  <div className="flex items-start gap-2 w-full">
                                    {getLocationIcon(suggestion.type, suggestion.is_famous)}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{suggestion.name}</span>
                                        {suggestion.is_famous && (
                                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex items-center gap-1">
                                          <span className="text-primary">
                                            {getLocationTypeLabel(suggestion.type, suggestion.is_famous)}
                                          </span>
                                          {suggestion.parent && (
                                            <span>• {suggestion.parent}</span>
                                          )}
                                        </div>
                                        {suggestion.description && (
                                          <p className="truncate">{suggestion.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          ) : manualLocation.length >= 2 && (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              No se encontraron ubicaciones
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={handleManualLocation}
                      disabled={!manualLocation.trim()}
                      className="w-full"
                    >
                      Buscar "{manualLocation}"
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Cities */}
          <Card className="bg-glass border-glass">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Ciudades populares</h3>
              <ScrollArea className="h-32">
                {loadingCities ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {cities.map((city) => (
                      <Button
                        key={city.id}
                        variant="ghost"
                        className="w-full justify-start text-sm h-8"
                        onClick={() => handleCitySelect(city)}
                      >
                        <Building className="h-3 w-3 mr-2 text-blue-500" />
                        {city.name}
                        {city.population && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {city.population.toLocaleString()} hab.
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
