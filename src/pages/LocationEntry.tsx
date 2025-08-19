
import { useNavigate } from 'react-router-dom';
import { Utensils, Heart, Star } from 'lucide-react';
import LocationSearchInput from '@/components/LocationSearchInput';

interface LocationOption {
  id: number;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'neighborhood' | 'postal_code' | 'poi';
  latitude: number;
  longitude: number;
  parent?: string;
  description?: string;
  is_famous?: boolean;
  postal_code?: string;
}

export default function LocationEntry() {
  const navigate = useNavigate();

  const handleLocationSelect = (location: LocationOption) => {
    // Save the selected location in localStorage
    localStorage.setItem('selectedLocation', JSON.stringify({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      type: location.type,
      parent: location.parent,
      address: location.parent ? `${location.name}, ${location.parent}` : location.name,
      postal_code: location.postal_code
    }));

    console.log('Location selected:', location);

    // Navigate to restaurants
    navigate('/restaurantes');
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Main content */}
      <div className="max-w-2xl w-full text-center space-y-8 relative z-10">
        {/* Logo/Title */}
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

        {/* Attractive description */}
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl text-white/90 font-medium">
            🍽️ Descubre los mejores sabores cerca de ti
          </h2>
          <p className="text-lg text-white/80 max-w-lg mx-auto leading-relaxed">
            Explora restaurantes increíbles, encuentra platos únicos y vive experiencias gastronómicas unforgettables
          </p>
        </div>

        {/* Enhanced location search */}
        <div className="space-y-4">
          <h3 className="text-lg text-white/90 font-medium">
            ¿Dónde quieres explorar?
          </h3>
          
          <div className="max-w-md mx-auto">
            <LocationSearchInput
              onLocationSelect={handleLocationSelect}
              placeholder="Buscar ciudad, municipio, distrito, barrio..."
              className="w-full"
            />
          </div>

          {/* Helper text */}
          <div className="text-sm text-white/70 max-w-sm mx-auto">
            <p>💡 Selecciona una ubicación de nuestra lista para encontrar los mejores restaurantes</p>
          </div>
        </div>

        {/* Featured characteristics */}
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
