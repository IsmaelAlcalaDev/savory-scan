import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, Utensils, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationSuggestions } from '@/hooks/useLocationSuggestions';
import { useNearestLocation } from '@/hooks/useNearestLocation';

export default function LocationEntry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const navigate = useNavigate();
  
  const { suggestions, loading: loadingSuggestions } = useLocationSuggestions(searchQuery);
  const { findNearestLocation } = useNearestLocation();

  const handleLocationSelect = (location: any) => {
    // Guardar la ubicación seleccionada en localStorage
    localStorage.setItem('selectedLocation', JSON.stringify({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      type: location.type,
      parent: location.parent,
      address: location.parent ? `${location.name}, ${location.parent}` : location.name
    }));

    // Redirigir a restaurantes
    navigate('/restaurantes');
  };

  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    
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
        handleLocationSelect({
          name: nearestLocation.name,
          latitude,
          longitude,
          type: nearestLocation.type,
          parent: nearestLocation.parent
        });
      } else {
        // Guardar ubicación GPS directamente
        localStorage.setItem('selectedLocation', JSON.stringify({
          latitude,
          longitude,
          address: 'Ubicación detectada'
        }));
        navigate('/restaurantes');
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
      
      console.error(errorMessage);
    } finally {
      setIsLoadingGPS(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Contenido principal */}
      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Logo/Título */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-white/20 p-4 rounded-full">
              <Utensils className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            Foodie<span className="text-white/80">Spot</span>
          </h1>
        </div>

        {/* Descripción atractiva */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl text-white/90 font-medium">
            🍽️ Descubre los mejores sabores cerca de ti
          </h2>
          <p className="text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
            Explora restaurantes increíbles, encuentra platos únicos y vive experiencias gastronómicas unforgettables
          </p>
        </div>

        {/* Buscador de ubicación */}
        <div className="space-y-4">
          <h3 className="text-lg text-white/90 font-medium">
            ¿Dónde quieres explorar?
          </h3>
          
          <div className="relative max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 bg-white/95 backdrop-blur-sm border-0 shadow-card text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-white/50"
                maxLength={50}
              />
            </div>

            {/* Sugerencias */}
            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border-0 rounded-lg shadow-float z-50 max-h-64 overflow-hidden">
                <ScrollArea className="max-h-64">
                  {loadingSuggestions ? (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="p-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.type}-${suggestion.id}`}
                          className="w-full text-left p-3 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={() => handleLocationSelect(suggestion)}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{suggestion.name}</div>
                              {suggestion.parent && (
                                <div className="text-sm text-gray-500">
                                  {suggestion.parent}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron ubicaciones
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        {/* Botón de ubicación actual */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm shadow-card"
            onClick={handleGPSLocation}
            disabled={isLoadingGPS}
          >
            <Navigation className="h-5 w-5 mr-2" />
            {isLoadingGPS ? 'Detectando ubicación...' : 'Usar mi ubicación actual'}
          </Button>
        </div>

        {/* Características destacadas */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-md mx-auto">
          <div className="text-center space-y-2">
            <div className="bg-white/20 p-3 rounded-full mx-auto w-fit">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <p className="text-white/80 text-sm font-medium">Restaurantes únicos</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-white/20 p-3 rounded-full mx-auto w-fit">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <p className="text-white/80 text-sm font-medium">Tus favoritos</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-white/20 p-3 rounded-full mx-auto w-fit">
              <Star className="h-6 w-6 text-white" />
            </div>
            <p className="text-white/80 text-sm font-medium">Las mejores reseñas</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-white/60 text-sm">
          Explora, descubre, disfruta 🚀
        </p>
      </div>
    </div>
  );
}
