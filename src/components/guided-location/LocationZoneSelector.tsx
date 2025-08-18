
import { MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationZoneSelectorProps {
  selectedCity: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  onStepChange: (step: 'districts', data?: any) => void;
  onLocationSelect: (location: any) => void;
}

export function LocationZoneSelector({ selectedCity, onStepChange, onLocationSelect }: LocationZoneSelectorProps) {
  const handleWholeCitySelect = () => {
    onLocationSelect({
      type: 'city',
      data: {
        name: selectedCity.name,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        type: 'city',
        address: selectedCity.name
      }
    });
  };

  const handleSpecificZoneSelect = () => {
    onStepChange('districts');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          ¿Prefieres toda la ciudad o una zona específica?
        </p>
      </div>

      {/* Whole City Option */}
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex items-center gap-4 text-left hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
        onClick={handleWholeCitySelect}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
          <Building className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">
            Toda la ciudad
          </div>
          <div className="text-sm text-muted-foreground">
            Ver restaurantes en todo {selectedCity.name}
          </div>
        </div>
      </Button>

      {/* Specific Zone Option */}
      <Button
        variant="outline"
        className="w-full h-auto p-4 flex items-center gap-4 text-left hover:bg-green-50 border-green-200 hover:border-green-300 transition-all duration-200"
        onClick={handleSpecificZoneSelect}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-md flex-shrink-0">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground mb-1">
            Zona específica
          </div>
          <div className="text-sm text-muted-foreground">
            Elegir distrito o barrio
          </div>
        </div>
      </Button>
    </div>
  );
}
