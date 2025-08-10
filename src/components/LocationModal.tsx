
import { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: { type: 'gps' | 'manual' | 'city'; data?: any }) => void;
}

export default function LocationModal({ open, onOpenChange, onLocationSelect }: LocationModalProps) {
  const [manualLocation, setManualLocation] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const { cities, loading: loadingCities } = useCities();

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

          {/* Manual Option */}
          <Card className="bg-glass border-glass">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium">Buscar ubicación manualmente</h3>
                  <p className="text-sm text-muted-foreground">
                    Introduce una ciudad, barrio o dirección
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Centro, Sevilla..."
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                      className="bg-background/50 border-glass"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleManualLocation}
                      disabled={!manualLocation.trim()}
                    >
                      Buscar
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
                        <MapPin className="h-3 w-3 mr-2" />
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
