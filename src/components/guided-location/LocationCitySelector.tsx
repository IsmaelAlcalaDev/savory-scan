
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCities } from '@/hooks/useCities';
import { Skeleton } from '@/components/ui/skeleton';

interface LocationCitySelectorProps {
  onStepChange: (step: 'zones', data: any) => void;
  onLocationSelect: (location: any) => void;
}

export function LocationCitySelector({ onStepChange, onLocationSelect }: LocationCitySelectorProps) {
  const { cities, loading } = useCities();

  const handleCitySelect = (city: any) => {
    onStepChange('zones', city);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Selecciona una ciudad para continuar
        </p>
      </div>
      
      <ScrollArea className="max-h-80">
        <div className="space-y-2">
          {cities.map((city) => (
            <Button
              key={city.id}
              variant="ghost"
              className="w-full h-auto p-3 flex items-center gap-3 text-left hover:bg-muted rounded-lg transition-all duration-200"
              onClick={() => handleCitySelect(city)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {city.name}
                </div>
                {city.population && (
                  <div className="text-xs text-muted-foreground">
                    {city.population.toLocaleString()} habitantes
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
