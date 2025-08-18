
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface LocationDistrictSelectorProps {
  selectedCity: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: any) => void;
}

interface District {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export function LocationDistrictSelector({ selectedCity, onLocationSelect }: LocationDistrictSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoading(true);
        
        // Fetch districts for the selected city
        const { data, error } = await supabase
          .from('districts')
          .select('id, name, latitude, longitude')
          .eq('city_id', selectedCity.id)
          .order('name')
          .limit(20);

        if (error) throw error;
        setDistricts(data || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [selectedCity.id]);

  const handleDistrictSelect = (district: District) => {
    onLocationSelect({
      type: 'suggestion',
      data: {
        name: district.name,
        latitude: district.latitude,
        longitude: district.longitude,
        type: 'district',
        parent: selectedCity.name,
        address: `${district.name}, ${selectedCity.name}`
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

  if (districts.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <MapPin className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-sm font-medium text-foreground mb-1">
          No hay distritos disponibles
        </div>
        <div className="text-xs text-muted-foreground">
          Para {selectedCity.name}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Selecciona un distrito o barrio en {selectedCity.name}
        </p>
      </div>
      
      <ScrollArea className="max-h-80">
        <div className="space-y-2">
          {districts.map((district) => (
            <Button
              key={district.id}
              variant="ghost"
              className="w-full h-auto p-3 flex items-center gap-3 text-left hover:bg-muted rounded-lg transition-all duration-200"
              onClick={() => handleDistrictSelect(district)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 flex-shrink-0">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">
                  {district.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedCity.name}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
