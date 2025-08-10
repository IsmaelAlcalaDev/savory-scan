import { useState, useEffect } from 'react';
import { Search, MapPin, User, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CuisineFilter from './CuisineFilter';
import FiltersSidebar from './FiltersSidebar';
import RestaurantCard from './RestaurantCard';
import LocationModal from './LocationModal';
import VegModeToggle from './VegModeToggle';
import BottomNavigation from './BottomNavigation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useIPLocation } from '@/hooks/useIPLocation';
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
  const [selectedEstablishments, setSelectedEstablishments] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nearby']);
  const [isVegMode, setIsVegMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Detectando ubicación...');
  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes' | 'account'>('restaurants');

  const { location: ipLocation, loading: ipLoading } = useIPLocation();

  useEffect(() => {
    if (ipLocation && !userLocation) {
      console.log('Setting user location from IP detection:', ipLocation);
      setUserLocation({
        lat: ipLocation.latitude,
        lng: ipLocation.longitude
      });
      
      const locationDisplay = `${ipLocation.city}, ${ipLocation.region}`;
      setCurrentLocationName(locationDisplay);
    }
  }, [ipLocation, userLocation]);

  const { restaurants, loading, error } = useRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 50,
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
    console.log('FoodieSpotLayout: Manual location selected:', location);
    if (location.type === 'gps') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      if (location.data.name && location.data.parent) {
        const locationDisplay = `${location.data.name}, ${location.data.parent.split(',')[0]}`;
        setCurrentLocationName(locationDisplay);
      } else if (location.data.address) {
        setCurrentLocationName(location.data.address);
      } else {
        setCurrentLocationName('Ubicación detectada');
      }
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
      const locationDisplay = location.data.parent 
        ? `${location.data.name}, ${location.data.parent.split(',')[0]}`
        : location.data.name;
      setCurrentLocationName(locationDisplay);
    } else if (location.type === 'manual') {
      setCurrentLocationName(location.data.query);
    }
    console.log('Updated location name:', currentLocationName);
  };

  const renderContent = () => {
    if (activeBottomTab === 'dishes') {
      return (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Platos</h2>
          <p className="text-muted-foreground">Próximamente disponible</p>
        </div>
      );
    }
    
    if (activeBottomTab === 'account') {
      return (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Mi Cuenta</h2>
          <p className="text-muted-foreground">Próximamente disponible</p>
        </div>
      );
    }

    // Default restaurants content
    return (
      <>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {userLocation ? 'Restaurantes cerca de ti' : 'Restaurantes'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${restaurants.length} resultados`}
              {userLocation && ' • Ordenados por distancia'}
              {ipLocation && ipLocation.accuracy === 'ip' && (
                <span className="text-xs text-muted-foreground ml-1">
                  (ubicación aproximada)
                </span>
              )}
            </p>
            {error && (
              <p className="text-sm text-destructive mt-1">Error: {error}</p>
            )}
          </div>
        </div>

        {/* Filter Badges with VEG Mode */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
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
          
          <div className="ml-auto">
            <VegModeToggle 
              isVegMode={isVegMode}
              onToggle={setIsVegMode}
            />
          </div>
        </div>

        {/* Restaurant Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
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
                services={restaurant.services}
                favoritesCount={restaurant.favorites_count}
                coverImageUrl={restaurant.cover_image_url}
                logoUrl={restaurant.logo_url}
              />
            ))
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20 px-[7.5%]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white -mx-[7.5%] px-[7.5%]">
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

          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
            <Button
              variant="ghost"
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap"
            >
              <MapPin className="h-4 w-4" />
              <span className="max-w-40 truncate">
                {ipLoading ? 'Detectando...' : currentLocationName}
              </span>
            </Button>

            {/* Search Bar en el nav */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar restaurantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

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

        {/* Tipos de Cocina sin separadores */}
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
          "w-80 bg-white transition-transform duration-300 md:translate-x-0 fixed md:static h-full z-40 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4">
            <FiltersSidebar
              selectedDistances={selectedDistances}
              onDistanceChange={setSelectedDistances}
              selectedRatings={selectedRatings}
              onRatingChange={setSelectedRatings}
              selectedEstablishments={selectedEstablishments}
              onEstablishmentChange={setSelectedEstablishments}
              selectedServices={selectedServices}
              onServiceChange={setSelectedServices}
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={setSelectedPriceRanges}
              selectedTimeRanges={selectedTimeRanges}
              onTimeRangeChange={setSelectedTimeRanges}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 mx-4 md:mx-8 lg:mx-12">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />

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
