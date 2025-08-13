
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { useIPLocation } from '@/hooks/useIPLocation';
import LocationInfo from '@/components/LocationInfo';

export default function LocationEntry() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState<any>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const { suggestions, loading: loadingSuggestions } = useLocationSuggestions(searchQuery);
  const { history, addToHistory, clearHistory } = useLocationHistory();
  const { findNearestLocation } = useNearestLocation();
  const { location: ipLocation, loading: ipLoading } = useIPLocation();

  useEffect(() => {
    // Si ya hay una ubicación IP detectada, mostrarla
    if (ipLocation && !ipLoading) {
      setDetectedLocation(`${ipLocation.city}, ${ipLocation.region}`);
    }
  }, [ipLocation, ipLoading]);

  const handleLocationSelect = (location: { type: 'gps' | 'manual' | 'city' | 'suggestion'; data?: any }) => {
    console.log('Location selected:', location);
    
    // Guardar la ubicación seleccionada en localStorage para uso posterior
    localStorage.setItem('userLocation', JSON.stringify(location));
    
    // Redirigir a restaurantes
    navigate('/restaurantes');
  };

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
      
      // Encontrar la ubicación más cercana en la base de datos
      const nearestLocation = await findNearestLocation(latitude, longitude);
      
      if (nearestLocation) {
        const locationText = nearestLocation.parent 
          ? `${nearestLocation.name}, ${nearestLocation.parent}`
          : nearestLocation.name;
        
        setDetectedLocation(locationText);
        
        handleLocationSelect({
          type: 'gps',
          data: {
            latitude,
            longitude,
            name: nearestLocation.name,
            type: nearestLocation.type,
            parent: nearestLocation.parent,
            address: locationText
          }
        });
      } else {
        setDetectedLocation('Ubicación detectada');
        handleLocationSelect({
          type: 'gps',
          data: {
            latitude,
            longitude,
            address: 'Ubicación detectada'
          }
        });
      }
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

    handleLocationSelect({
      type: 'suggestion',
      data: {
        name: suggestion.name,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        type: suggestion.type,
        parent: suggestion.parent
      }
    });
  };

  const handleHistorySelect = (item: any) => {
    handleLocationSelect({
      type: 'suggestion',
      data: {
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        type: item.type,
        parent: item.parent
      }
    });
  };

  const showInfo = (location: any) => {
    if (location.type === 'poi' && location.description) {
      setShowLocationInfo(location);
    }
  };

  const handleUseIPLocation = () => {
    if (ipLocation) {
      handleLocationSelect({
        type: 'suggestion',
        data: {
          name: ipLocation.city,
          latitude: ipLocation.latitude,
          longitude: ipLocation.longitude,
          type: 'city',
          parent: `${ipLocation.region}, ${ipLocation.country}`,
          address: `${ipLocation.city}, ${ipLocation.region}`
        }
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Selecciona tu ubicación - FoodieSpot</title>
        <meta name="description" content="Selecciona tu ubicación para encontrar los mejores restaurantes cerca de ti" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FoodieSpot</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¿Dónde estás?
              </h1>
              <p className="text-gray-600">
                Selecciona tu ubicación para encontrar los mejores restaurantes cerca de ti
              </p>
            </div>

            <div className="space-y-4">
              {/* GPS Button */}
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 h-12" 
                onClick={handleGPSLocation}
                disabled={isLoadingGPS}
              >
                <Navigation className="h-5 w-5" />
                {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
              </Button>

              {/* IP Location Button */}
              {ipLocation && !ipLoading && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-12" 
                  onClick={handleUseIPLocation}
                >
                  <MapPin className="h-5 w-5" />
                  {ipLocation.city}, {ipLocation.region}
                </Button>
              )}

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
                    className="pl-10 h-12"
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
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-8">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center text-sm text-gray-600">
              <p>&copy; 2024 FoodieSpot. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
