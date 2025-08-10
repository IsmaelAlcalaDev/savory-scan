
import { useState } from 'react';
import { Search, MapPin, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CuisineFilter from './CuisineFilter';
import DistanceFilter from './DistanceFilter';
import RatingFilter from './RatingFilter';
import RestaurantCard from './RestaurantCard';
import LocationModal from './LocationModal';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Skeleton } from '@/components/ui/skeleton';

const filterOptions = [
  { id: 'nearby', label: 'Cerca de mí', active: true },
  { id: 'open', label: 'Abierto', active: false },
  { id: 'economic', label: 'Económico', active: false },
  { id: 'top', label: 'Top', active: false },
];

export default function FoodieSpotLayout() {
  console.log('FoodieSpotLayout: Rendering component');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nearby']);
  const [isVegMode, setIsVegMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Tu ubicación actual');

  // Use real restaurant data
  const { restaurants, loading, error } = useRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 10,
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    minRating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : 0
  });

  console.log('FoodieSpotLayout: Restaurants hook result:', { restaurants, loading, error });

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleLocationSelect = (location: { type: string; data?: any }) => {
    console.log('FoodieSpotLayout: Location selected:', location);
    if (location.type === 'gps') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      setCurrentLocationName('Tu ubicación actual');
    } else if (location.type === 'city') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      setCurrentLocationName(location.data.name);
    } else if (location.type === 'suggestion') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      // Mostrar nombre con contexto si está disponible
      const locationDisplay = location.data.parent 
        ? `${location.data.name}, ${location.data.parent.split(',')[0]}`
        : location.data.name;
      setCurrentLocationName(locationDisplay);
    } else if (location.type === 'manual') {
      setCurrentLocationName(location.data.query);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">FoodieSpot</h1>
              <p className="text-xs text-muted-foreground">Food delivery</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <MapPin className="h-4 w-4" />
            <span className="max-w-40 truncate">{currentLocationName}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar restaurantes ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Cuisine Filter */}
        <div className="px-4 pb-4">
          <CuisineFilter 
            selectedCuisines={selectedCuisines}
            onCuisineChange={setSelectedCuisines}
          />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Filters */}
        <aside className={cn(
          "w-80 border-r border-border bg-background transition-transform duration-300 md:translate-x-0 fixed md:static h-full z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 space-y-4">
            <DistanceFilter 
              selectedDistances={selectedDistances}
              onDistanceChange={setSelectedDistances}
            />
            <RatingFilter 
              selectedRatings={selectedRatings}
              onRatingChange={setSelectedRatings}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Restaurantes cerca de ti</h2>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Cargando...' : `${restaurants.length} resultados`}
                </p>
                {error && (
                  <p className="text-sm text-destructive mt-1">Error: {error}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Modo VEG</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVegMode(!isVegMode)}
                  className={cn(
                    "relative w-12 h-6 rounded-full p-0",
                    isVegMode ? "bg-green-500" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                    isVegMode ? "translate-x-6" : "translate-x-0.5"
                  )} />
                </Button>
              </div>
            </div>

            {/* Filter Badges */}
            <div className="flex gap-2 mb-6">
              {filterOptions.map((filter) => (
                <Badge
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterToggle(filter.id)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : error ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">Error al cargar restaurantes: {error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Revisa la consola para más detalles
                  </p>
                </div>
              ) : restaurants.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No se encontraron restaurantes</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Intenta cambiar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    description={restaurant.description}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Location Modal */}
      <LocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        onLocationSelect={handleLocationSelect}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
