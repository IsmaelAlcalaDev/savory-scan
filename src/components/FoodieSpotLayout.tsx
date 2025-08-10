import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, User } from 'lucide-react';
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
import AccountModal from './AccountModal';
import MenuModal from './MenuModal';
import LanguageSelector from './LanguageSelector';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useIPLocation } from '@/hooks/useIPLocation';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
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
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nearby']);
  const [isVegMode, setIsVegMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Detectando ubicación...');
  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes' | 'account'>('restaurants');
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  const { location: ipLocation, loading: ipLoading } = useIPLocation();
  const { distanceRanges } = useDistanceRanges();
  const { ratingOptions } = useRatingOptions();
  const { establishmentTypes } = useEstablishmentTypes();
  const { services } = useServices();
  const { priceRanges } = usePriceRanges();
  const { timeRanges } = useTimeRanges();
  const { cuisineTypes } = useCuisineTypes();
  const { dietTypes } = useDietTypes();

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

  useEffect(() => {
    const bodyElement = document.body;
    const htmlElement = document.documentElement;
    
    if (isVegMode) {
      bodyElement.classList.add('veg-mode');
      htmlElement.classList.add('veg-mode');
    } else {
      bodyElement.classList.remove('veg-mode');
      htmlElement.classList.remove('veg-mode');
    }
    
    // Cleanup function
    return () => {
      bodyElement.classList.remove('veg-mode');
      htmlElement.classList.remove('veg-mode');
    };
  }, [isVegMode]);

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

  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedDistances([]);
    setSelectedRatings([]);
    setSelectedEstablishments([]);
    setSelectedServices([]);
    setSelectedPriceRanges([]);
    setSelectedTimeRanges([]);
    setSelectedDietTypes([]);
    setActiveFilters([]);
  };

  const removeFilter = (filterType: string, value: any) => {
    switch (filterType) {
      case 'cuisine':
        setSelectedCuisines(prev => prev.filter(id => id !== value));
        break;
      case 'distance':
        setSelectedDistances(prev => prev.filter(id => id !== value));
        break;
      case 'rating':
        setSelectedRatings(prev => prev.filter(id => id !== value));
        break;
      case 'establishment':
        setSelectedEstablishments(prev => prev.filter(id => id !== value));
        break;
      case 'service':
        setSelectedServices(prev => prev.filter(id => id !== value));
        break;
      case 'price':
        setSelectedPriceRanges(prev => prev.filter(range => range !== value));
        break;
      case 'time':
        setSelectedTimeRanges(prev => prev.filter(id => id !== value));
        break;
      case 'diet':
        setSelectedDietTypes(prev => prev.filter(slug => slug !== value));
        break;
      case 'quick':
        setActiveFilters(prev => prev.filter(id => id !== value));
        break;
    }
  };

  const getActiveFiltersDisplay = () => {
    const filters = [];

    // Quick filters (except 'nearby' as it's default)
    activeFilters.forEach(filterId => {
      if (filterId !== 'nearby') {
        const quickFilter = filterOptions.find(f => f.id === filterId);
        if (quickFilter) {
          filters.push({
            type: 'quick',
            value: filterId,
            label: quickFilter.label
          });
        }
      }
    });

    // Cuisines
    selectedCuisines.forEach(id => {
      const cuisine = cuisineTypes?.find(c => c.id === id);
      if (cuisine) {
        filters.push({
          type: 'cuisine',
          value: id,
          label: cuisine.name
        });
      }
    });

    // Distance
    selectedDistances.forEach(id => {
      const distance = distanceRanges?.find(d => d.id === id);
      if (distance) {
        filters.push({
          type: 'distance',
          value: id,
          label: distance.display_text
        });
      }
    });

    // Rating
    selectedRatings.forEach(id => {
      const rating = ratingOptions?.find(r => r.id === id);
      if (rating) {
        filters.push({
          type: 'rating',
          value: id,
          label: rating.display_text
        });
      }
    });

    // Establishments
    selectedEstablishments.forEach(id => {
      const establishment = establishmentTypes?.find(e => e.id === id);
      if (establishment) {
        filters.push({
          type: 'establishment',
          value: id,
          label: establishment.name
        });
      }
    });

    // Services
    selectedServices.forEach(id => {
      const service = services?.find(s => s.id === id);
      if (service) {
        filters.push({
          type: 'service',
          value: id,
          label: service.name
        });
      }
    });

    // Price ranges
    selectedPriceRanges.forEach(value => {
      const priceRange = priceRanges?.find(p => p.value === value);
      if (priceRange) {
        filters.push({
          type: 'price',
          value: value,
          label: priceRange.display_text
        });
      }
    });

    // Time ranges
    selectedTimeRanges.forEach(id => {
      const timeRange = timeRanges?.find(t => t.id === id);
      if (timeRange) {
        filters.push({
          type: 'time',
          value: id,
          label: timeRange.display_text
        });
      }
    });

    // Diet types
    selectedDietTypes.forEach(slug => {
      const dietType = dietTypes?.find(d => d.slug === slug);
      if (dietType) {
        filters.push({
          type: 'diet',
          value: slug,
          label: dietType.name
        });
      }
    });

    return filters;
  };

  const handleBottomTabChange = (tab: 'restaurants' | 'dishes' | 'account') => {
    if (tab === 'account') {
      setAccountModalOpen(true);
    } else {
      setActiveBottomTab(tab);
    }
  };

  const handleLoginRequired = () => {
    setAccountModalOpen(true);
  };

  const TagButton = ({ 
    children, 
    isSelected, 
    onClick
  }: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full !bg-transparent !shadow-none !backdrop-blur-none flex items-center whitespace-nowrap flex-shrink-0",
        isSelected 
          ? "!bg-primary text-primary-foreground hover:!bg-primary/90 border-primary" 
          : "!bg-transparent hover:!bg-muted/50 text-muted-foreground hover:text-foreground border-border"
      )}
    >
      <span className="flex items-center">{children}</span>
    </button>
  );

  const FilterTag = ({ 
    children, 
    onRemove
  }: {
    children: React.ReactNode;
    onRemove: () => void;
  }) => (
    <button
      onClick={onRemove}
      className="h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full bg-transparent text-primary border-primary hover:bg-primary/5 flex items-center whitespace-nowrap flex-shrink-0"
    >
      <span className="flex items-center">{children}</span>
      <X className="ml-1 h-3 w-3 flex-shrink-0" />
    </button>
  );

  const renderContent = () => {
    if (activeBottomTab === 'dishes') {
      return (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Platos</h2>
          <p className="text-muted-foreground">Próximamente disponible</p>
        </div>
      );
    }

    const activeFiltersDisplay = getActiveFiltersDisplay();

    // Default restaurants content (siempre mostrar cuando no sea 'dishes')
    return (
      <>
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-semibold mb-1 mode-transition ${isVegMode ? 'animate-grow-bounce' : ''}`}>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {filterOptions.map((filter) => (
                <TagButton
                  key={filter.id}
                  isSelected={activeFilters.includes(filter.id)}
                  onClick={() => handleFilterToggle(filter.id)}
                >
                  {filter.label}
                </TagButton>
              ))}
            </div>
            {/* Fade gradient for overflow */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
          
          <div className={`flex-shrink-0 ${isVegMode ? 'animate-leaf-sway' : ''}`}>
            <VegModeToggle 
              isVegMode={isVegMode}
              onToggle={setIsVegMode}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersDisplay.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-6">
              <div className="relative flex-1 min-w-0">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {activeFiltersDisplay.map((filter, index) => (
                    <FilterTag
                      key={`${filter.type}-${filter.value}-${index}`}
                      onRemove={() => removeFilter(filter.type, filter.value)}
                    >
                      {filter.label}
                    </FilterTag>
                  ))}
                </div>
                {/* Fade gradient for overflow */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
              <button 
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

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
                onLoginRequired={handleLoginRequired}
              />
            ))
          )}
        </div>
      </>
    );
  };

  return (
    <div className={`min-h-screen bg-white pb-20 px-[7.5%] mode-transition`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white -mx-[7.5%] px-[7.5%] mode-transition">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-primary rounded-full flex items-center justify-center mode-transition ${isVegMode ? 'animate-grow-bounce' : ''}`}>
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-bold text-lg mode-transition">FoodieSpot</h1>
              <p className="text-xs text-muted-foreground">Food delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl mx-4">
            <Button
              variant="ghost"
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive hover:bg-transparent whitespace-nowrap"
            >
              <MapPin className="h-4 w-4" />
              <span className="max-w-40 truncate">
                {ipLoading ? 'Detectando...' : currentLocationName}
              </span>
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Buscar restaurantes, platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 text-base bg-background/50 border border-gray-600 backdrop-blur-sm focus:bg-background/80 transition-smooth rounded-full focus:border-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button 
              variant="ghost" 
              size="sm" 
              className="mode-transition"
              onClick={() => setMenuModalOpen(true)}
            >
              <Menu className="h-10 w-10" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden mode-transition"
            >
              <Menu className="h-10 w-10" />
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
          "w-80 bg-white transition-transform duration-300 md:translate-x-0 fixed md:static h-full z-40 overflow-y-auto mode-transition",
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
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={setSelectedDietTypes}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-4 ml-8 md:ml-10 lg:ml-14 mr-4 md:mr-8 lg:mr-12">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeBottomTab}
        onTabChange={handleBottomTabChange}
      />

      {/* Account Modal */}
      <AccountModal
        open={accountModalOpen}
        onOpenChange={setAccountModalOpen}
      />

      {/* Menu Modal */}
      <MenuModal
        open={menuModalOpen}
        onOpenChange={setMenuModalOpen}
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
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
