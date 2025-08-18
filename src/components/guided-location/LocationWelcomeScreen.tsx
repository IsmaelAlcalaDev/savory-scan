
import { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationDetection } from '@/hooks/useLocationDetection';

interface LocationWelcomeScreenProps {
  onStepChange: (step: 'cities' | 'quicksearch') => void;
  onLocationSelect: (location: any) => void;
}

export function LocationWelcomeScreen({ onStepChange, onLocationSelect }: LocationWelcomeScreenProps) {
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const { detectLocation } = useLocationDetection();

  const handleGPSDetection = async () => {
    setIsDetectingGPS(true);
    try {
      const location = await detectLocation();
      if (location) {
        onLocationSelect({
          type: 'gps',
          data: {
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            type: location.type,
            parent: location.parent,
            address: location.address
          }
        });
      }
    } catch (error) {
      console.error('GPS detection failed:', error);
    } finally {
      setIsDetectingGPS(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* GPS Option */}
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex items-center gap-4 text-left hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
        onClick={handleGPSDetection}
        disabled={isDetectingGPS}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
          <Navigation className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">
            {isDetectingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
          </div>
          <div className="text-sm text-muted-foreground">
            Encuentra restaurantes cerca de ti
          </div>
        </div>
        {isDetectingGPS && (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        )}
      </Button>

      {/* Guided Navigation */}
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex items-center gap-4 text-left hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200"
        onClick={() => onStepChange('cities')}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-md flex-shrink-0">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">
            Elegir ciudad
          </div>
          <div className="text-sm text-muted-foreground">
            Navegación guiada paso a paso
          </div>
        </div>
      </Button>

      {/* Quick Search */}
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex items-center gap-4 text-left hover:bg-purple-50 border-purple-200 hover:border-purple-300 transition-all duration-200"
        onClick={() => onStepChange('quicksearch')}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 shadow-md flex-shrink-0">
          <Search className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">
            Búsqueda rápida
          </div>
          <div className="text-sm text-muted-foreground">
            Escribe cualquier ubicación
          </div>
        </div>
      </Button>
    </div>
  );
}
