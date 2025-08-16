
import { useState } from 'react';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LocationModal from './LocationModal';

interface LocationDetectorProps {
  loading: boolean;
  location: any;
  error: string | null;
  onGPSRequest: () => Promise<void>;
  onManualLocation: (location: any) => void;
}

export default function LocationDetector({
  loading,
  location,
  error,
  onGPSRequest,
  onManualLocation
}: LocationDetectorProps) {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleGPSRequest = async () => {
    setGpsLoading(true);
    try {
      await onGPSRequest();
    } catch (err) {
      console.error('GPS request failed:', err);
    } finally {
      setGpsLoading(false);
    }
  };

  const handleLocationSelect = (locationData: any) => {
    onManualLocation(locationData.data);
    setShowLocationModal(false);
  };

  if (loading) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h3 className="text-lg font-semibold mb-2">Detectando tu ubicación</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Esto nos ayuda a mostrarte restaurantes cerca de ti
          </p>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowLocationModal(true)}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Elegir ubicación manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !location) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error de ubicación</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          
          <div className="space-y-2">
            <Button
              variant="default"
              onClick={handleGPSRequest}
              disabled={gpsLoading}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {gpsLoading ? 'Intentando...' : 'Intentar GPS de nuevo'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowLocationModal(true)}
              className="w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Elegir ubicación manualmente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (location) {
    return (
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          {location.method === 'gps' && <Navigation className="h-4 w-4 text-green-600" />}
          {location.method === 'ip' && <MapPin className="h-4 w-4 text-blue-600" />}
          {location.method === 'manual' && <MapPin className="h-4 w-4 text-purple-600" />}
          {location.method === 'cached' && <Clock className="h-4 w-4 text-gray-600" />}
          
          <div>
            <span className="text-sm font-medium">{location.name}</span>
            <div className="text-xs text-muted-foreground">
              {location.method === 'gps' && 'Ubicación GPS'}
              {location.method === 'ip' && 'Detectada por IP'}
              {location.method === 'manual' && 'Seleccionada manualmente'}
              {location.method === 'cached' && 'Ubicación guardada'}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLocationModal(true)}
        >
          Cambiar
        </Button>
      </div>
    );
  }

  return (
    <>
      <LocationModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}
