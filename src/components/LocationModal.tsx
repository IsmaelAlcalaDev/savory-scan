import { useState } from 'react';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntelligentLocationSuggestions } from '@/hooks/useIntelligentLocationSuggestions';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { Skeleton } from '@/components/ui/skeleton';
import LocationInfo from './LocationInfo';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (location: {
    type: 'gps' | 'manual' | 'city' | 'suggestion';
    data?: any;
  }) => void;
}
export default function LocationModal({
  open,
  onOpenChange,
  onLocationSelect
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState<any>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const {
    suggestions,
    loading: loadingSuggestions
  } = useIntelligentLocationSuggestions(searchQuery);
  const {
    history,
    addToHistory,
    clearHistory
  } = useLocationHistory();
  const {
    findNearestLocation
  } = useNearestLocation();
  const {
    reverseGeocode
  } = useReverseGeocoding();
  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    setDetectedLocation('');
    try {
      console.log('Requesting geolocation permission...');
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocalización no soportada en este navegador');
      }
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const {
        latitude,
        longitude
      } = position.coords;
      console.log('GPS coordinates obtained:', {
        latitude,
        longitude
      });

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
  return <Dialog open={open} onOpenChange={onOpenChange}>
      
    </Dialog>;
}