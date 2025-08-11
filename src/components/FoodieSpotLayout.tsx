import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, User, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CuisineFilter from './CuisineFilter';
import FiltersModal from './FiltersModal';
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
import { useAppSettings } from '@/hooks/useAppSettings';

const filterOptions = [
  { id: 'nearby', label: 'Cerca de mí', active: true },
  { id: 'open', label: 'Abierto', active: false },
  { id: 'economic', label: 'Económico', active: false },
  { id: 'top', label: 'Top', active: false },
];

export default function FoodieSpotLayout() {
  console.log('FoodieSpotLayout: Rendering component');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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

  // Cargar configuración de branding desde la BD
  const { data: appSettings } = useAppSettings();
  const appName = appSettings?.appName ?? 'FoodieSpot';
  const appLogoUrl = appSettings?.logoUrl ?? 'https://w7.pngwing.com/pngs/256/867/png-transparent-zomato-logo-thumbnail.png';

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

    // Dynamic title based on location
    const getDynamicTitle = () => {
      if (userLocation) {
        return `${restaurants.length} restaurantes cerca de ti`;
      }
      
      if (ipLocation) {
        const locationName = ipLocation.city || 'tu ubicación';
        return `${restaurants.length} restaurantes en ${locationName}`;
      }
      
      return `${restaurants.length} restaurantes`;
    };

    const getLocationNote = () => {
      if (ipLocation && ipLocation.accuracy === 'ip') {
        return 'ubicación aproximada';
      }
      if (userLocation) {
        return 'ordenados por distancia';
      }
      return null;
    };

    // Default restaurants content (siempre mostrar cuando no sea 'dishes')
    return (
      <>
        {/* Results Header with Dynamic Title */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className={`text-xl font-semibold mb-1 mode-transition ${isVegMode ? 'animate-grow-bounce' : ''}`}>
              {loading ? 'Cargando restaurantes...' : getDynamicTitle()}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getLocationNote() && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {getLocationNote()}
                </span>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive mt-1">Error: {error}</p>
            )}
          </div>
        </div>

        {/* Filter Badges with VEG Mode */}
        <div className="flex items-center gap-4 mb-2 pt-1 pb-1">
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-14 pr-4">
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
            {/* Botón de filtros fijo */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 bg-white pr-2">
              <FiltersModal
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
          <div className="mb-4">
            <div className="flex items-center gap-6">
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-1 pr-4">
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

        {/* Restaurant Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
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
        <div className="flex items-center justify-between py-3 px-4">
          {/* Left Section: Logo */}
          <div className="flex items-center flex-shrink-0 relative">
            <img 
              src={appLogoUrl}
              alt={`${appName} Logo`} 
              className={`w-24 h-24 bg-transparent object-contain mode-transition absolute top-1/2 left-0 transform -translate-y-1/2 z-10 ${isVegMode ? 'animate-grow-bounce' : ''}`}
            />
            {/* Spacer to maintain layout */}
            <div className="w-24 h-8" />
          </div>

          {/* Center Section: Location and Search */}
          <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-8">
            {/* Location Section */}
            <div className="flex justify-start">
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
            </div>

            {/* Search Section */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors z-10 ${
                  isSearchFocused ? 'text-red-500' : 'text-muted-foreground'
                }`} />
                <Input
                  type="text"
                  placeholder="Buscar restaurantes, platos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-4 h-10 text-base bg-background/50 border border-muted-foreground backdrop-blur-sm rounded-full focus:border-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Right Section: Language & Menu */}
          <div className="flex items-center gap-12 flex-shrink-0">
            <LanguageSelector />
            <button 
              className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent mode-transition text-gray-800 hover:text-gray-600 transition-colors"
              onClick={() => setMenuModalOpen(true)}
            >
              <Menu className="h-8 w-8" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Tipos de Cocina */}
        <div className="px-4 pb-2 pt-2">
          <CuisineFilter 
            selectedCuisines={selectedCuisines}
            onCuisineChange={setSelectedCuisines}
          />
        </div>
      </header>

      {/* Main Content - Full Width */}
      <div className="w-full">
        <div className="p-4">
          {renderContent()}
        </div>
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
