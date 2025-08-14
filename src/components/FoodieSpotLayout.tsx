import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import CuisineFilter from './CuisineFilter';
import FoodTypeFilter from './FoodTypeFilter';
import RestaurantCard from './RestaurantCard';
import AllDishCard from './AllDishCard';
import LocationModal from './LocationModal';
import BottomNavigation from './BottomNavigation';
import AuthModal from './AuthModal';
import MenuModal from './MenuModal';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletHeader';
import DesktopHeader from './DesktopHeader';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';
import DishesGrid from './DishesGrid';
import FilterTags, { ResetFiltersButton } from './FilterTags';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes' | 'account';
}

export default function FoodieSpotLayout({
  initialTab = 'restaurants'
}: FoodieSpotLayoutProps) {
  console.log('FoodieSpotLayout: Rendering component with initialTab:', initialTab);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Separate search states for each tab
  const [searchQueryRestaurants, setSearchQueryRestaurants] = useState('');
  const [searchQueryDishes, setSearchQueryDishes] = useState('');
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);

  // Estados para filtros
  const [selectedDistance, setSelectedDistance] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState<string | undefined>();
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Selecciona ubicación');
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Determine active tab based on current route
  const getActiveTabFromRoute = (): 'restaurants' | 'dishes' | 'account' => {
    if (location.pathname === '/platos') return 'dishes';
    if (location.pathname === '/restaurantes' || location.pathname === '/') return 'restaurants';
    return 'restaurants';
  };
  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes' | 'account'>(getActiveTabFromRoute());

  // Update active tab when route changes and scroll to top
  useEffect(() => {
    const newTab = getActiveTabFromRoute();
    console.log('Route changed, updating active tab to:', newTab, 'from path:', location.pathname);
    setActiveBottomTab(newTab);
    
    // Scroll to top when switching tabs
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Cargar configuración de branding desde la BD
  const {
    data: appSettings
  } = useAppSettings();
  const appName = appSettings?.appName ?? 'FoodieSpot';
  const appLogoUrl = appSettings?.logoUrl ?? 'https://w7.pngwing.com/pngs/256/867/png-transparent-zomato-logo-thumbnail.png';

  // Cargar ubicación guardada o solicitar GPS
  useEffect(() => {
    const loadSavedLocation = () => {
      try {
        const savedLocation = localStorage.getItem('selectedLocation');
        if (savedLocation) {
          const locationData = JSON.parse(savedLocation);
          console.log('Loading saved location:', locationData);
          if (locationData.latitude && locationData.longitude) {
            setUserLocation({
              lat: locationData.latitude,
              lng: locationData.longitude
            });

            // Determinar nombre de la ubicación
            if (locationData.address) {
              setCurrentLocationName(locationData.address);
            } else if (locationData.name && locationData.parent) {
              const locationDisplay = `${locationData.name}, ${locationData.parent.split(',')[0]}`;
              setCurrentLocationName(locationDisplay);
            } else if (locationData.name) {
              setCurrentLocationName(locationData.name);
            } else {
              setCurrentLocationName('Ubicación guardada');
            }
            return true;
          }
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
      return false;
    };
    const requestGPSLocation = async () => {
      if (!('geolocation' in navigator)) {
        console.log('Geolocation not supported');
        return;
      }
      setIsLoadingLocation(true);
      setCurrentLocationName('Detectando ubicación...');
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
          });
        });
        const {
          latitude,
          longitude
        } = position.coords;
        console.log('GPS location obtained:', {
          latitude,
          longitude
        });
        setUserLocation({
          lat: latitude,
          lng: longitude
        });
        setCurrentLocationName('Ubicación detectada');

        // Guardar en localStorage
        localStorage.setItem('selectedLocation', JSON.stringify({
          latitude,
          longitude,
          address: 'Ubicación detectada'
        }));
      } catch (error: any) {
        console.error('GPS Error:', error);
        setCurrentLocationName('Selecciona ubicación');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    // Primero intentar cargar ubicación guardada
    const hasSavedLocation = loadSavedLocation();

    // Si no hay ubicación guardada, solicitar GPS
    if (!hasSavedLocation) {
      requestGPSLocation();
    }
  }, []);

  const handleClearFilter = (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'sort' | 'timeRange' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisines([]);
        break;
      case 'foodType':
        setSelectedFoodTypes([]);
        break;
      case 'distance':
        setSelectedDistance([]);
        break;
      case 'price':
        setSelectedPriceRanges([]);
        break;
      case 'rating':
        setSelectedRating(undefined);
        break;
      case 'establishment':
        setSelectedEstablishmentTypes([]);
        break;
      case 'diet':
        setSelectedDietTypes([]);
        break;
      case 'sort':
        setSelectedSort(undefined);
        break;
      case 'timeRange':
        setSelectedTimeRanges([]);
        break;
      case 'openNow':
        setIsOpenNow(!isOpenNow);
        break;
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedDistance([]);
        setSelectedPriceRanges([]);
        setSelectedRating(undefined);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setSelectedSort(undefined);
        setSelectedTimeRanges([]);
        setIsOpenNow(false);
        break;
    }
  };

  // Get current search query based on active tab
  const getCurrentSearchQuery = () => {
    return activeBottomTab === 'dishes' ? searchQueryDishes : searchQueryRestaurants;
  };

  // Set search query for current tab
  const setCurrentSearchQuery = (query: string) => {
    if (activeBottomTab === 'dishes') {
      setSearchQueryDishes(query);
    } else {
      setSearchQueryRestaurants(query);
    }
  };

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurants({
    searchQuery: searchQueryRestaurants,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 50,
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    minRating: 0
  });
  
  const {
    dishes,
    loading: dishesLoading,
    error: dishesError
  } = useDishes({
    searchQuery: searchQueryDishes,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 50,
    selectedFoodTypes,
    spiceLevels: [],
    prepTimeRanges: []
  });

  console.log('FoodieSpotLayout: Hook results:', {
    restaurants: restaurants.length,
    restaurantsLoading,
    restaurantsError,
    dishes: dishes.length,
    dishesLoading,
    dishesError,
    activeBottomTab,
    searchQueryRestaurants,
    searchQueryDishes
  });

  const handleLocationSelect = (location: {
    type: string;
    data?: any;
  }) => {
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
      const locationDisplay = location.data.parent ? `${location.data.name}, ${location.data.parent.split(',')[0]}` : location.data.name;
      setCurrentLocationName(locationDisplay);
    } else if (location.type === 'manual') {
      setCurrentLocationName(location.data.query);
    }
    console.log('Updated location name:', currentLocationName);
  };

  const handleBottomTabChange = (tab: 'restaurants' | 'dishes' | 'account') => {
    console.log('Bottom tab change requested to:', tab);
    if (tab === 'account') {
      setAuthModalOpen(true);
      return;
    }
    if (tab === 'dishes') {
      navigate('/platos', {
        replace: true
      });
    } else if (tab === 'restaurants') {
      navigate('/restaurantes', {
        replace: true
      });
    }
  };
  
  const handleLoginRequired = () => {
    setAuthModalOpen(true);
  };

  // Get dynamic placeholder based on active tab
  const getSearchPlaceholder = () => {
    return activeBottomTab === 'dishes' ? 'Buscar platos...' : 'Buscar restaurantes...';
  };

  const renderHeader = () => {
    if (isMobile) {
      return <MobileHeader appName={appName} appLogoUrl={appLogoUrl} currentLocationName={currentLocationName} isLoadingLocation={isLoadingLocation} onLogoClick={() => navigate('/restaurantes')} onLocationClick={() => setLocationModalOpen(true)} onMenuClick={() => setMenuModalOpen(true)} />;
    } else if (window.innerWidth < 1024) {
      // Tablet
      return <TabletHeader appName={appName} appLogoUrl={appLogoUrl} currentLocationName={currentLocationName} isLoadingLocation={isLoadingLocation} searchQuery={getCurrentSearchQuery()} searchPlaceholder={getSearchPlaceholder()} isSearchFocused={isSearchFocused} onLogoClick={() => navigate('/restaurantes')} onLocationClick={() => setLocationModalOpen(true)} onMenuClick={() => setMenuModalOpen(true)} onSearchChange={setCurrentSearchQuery} onSearchFocus={() => setIsSearchFocused(true)} onSearchBlur={() => setIsSearchFocused(false)} />;
    } else {
      // Desktop
      return <DesktopHeader appName={appName} appLogoUrl={appLogoUrl} currentLocationName={currentLocationName} isLoadingLocation={isLoadingLocation} searchQuery={getCurrentSearchQuery()} searchPlaceholder={getSearchPlaceholder()} isSearchFocused={isSearchFocused} onLogoClick={() => navigate('/restaurantes')} onLocationClick={() => setLocationModalOpen(true)} onMenuClick={() => setMenuModalOpen(true)} onSearchChange={setCurrentSearchQuery} onSearchFocus={() => setIsSearchFocused(true)} onSearchBlur={() => setIsSearchFocused(false)} />;
    }
  };

  const renderContent = () => {
    const hasActiveFilters: boolean = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedDistance.length > 0 || 
    selectedPriceRanges.length > 0 || 
    !!selectedRating || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    !!selectedSort ||
    selectedTimeRanges.length > 0 ||
    isOpenNow;

    if (activeBottomTab === 'dishes') {
      return <>
          {/* Filter Tags */}
          <FilterTags 
            activeTab="dishes" 
            selectedCuisines={selectedCuisines} 
            selectedFoodTypes={selectedFoodTypes} 
            selectedDistance={selectedDistance} 
            selectedPriceRanges={selectedPriceRanges} 
            selectedRating={selectedRating} 
            selectedEstablishmentTypes={selectedEstablishmentTypes} 
            selectedDietTypes={selectedDietTypes} 
            selectedSort={selectedSort}
            selectedTimeRanges={selectedTimeRanges}
            isOpenNow={isOpenNow} 
            onClearFilter={handleClearFilter}
            onSortChange={setSelectedSort}
            onDistanceChange={setSelectedDistance}
            onPriceRangeChange={setSelectedPriceRanges}
            onRatingChange={setSelectedRating}
            onEstablishmentTypeChange={setSelectedEstablishmentTypes}
            onDietTypeChange={setSelectedDietTypes}
            onTimeRangeChange={setSelectedTimeRanges}
            onOpenNowChange={(value: boolean) => setIsOpenNow(value)}
          />

          {/* Results Header with adjusted spacing */}
          <div className="flex items-center justify-between mb-3 mt-3">
            <div>
              <h2 className="text-sm font-medium mb-1 text-muted-foreground">
                {dishesLoading ? 'Cargando...' : `${dishes.length} resultados`}
              </h2>
              {dishesError && <p className="text-sm text-destructive mt-1">Error: {dishesError}</p>}
            </div>
            <ResetFiltersButton 
              hasActiveFilters={hasActiveFilters} 
              onClearAll={() => handleClearFilter('all')} 
            />
          </div>

          <DishesGrid dishes={dishes} loading={dishesLoading} error={dishesError} />
        </>;
    }

    // Default restaurants content (siempre mostrar cuando no sea 'dishes')
    return <>
        {/* Filter Tags */}
        <FilterTags 
          activeTab="restaurants" 
          selectedCuisines={selectedCuisines} 
          selectedFoodTypes={selectedFoodTypes} 
          selectedDistance={selectedDistance} 
          selectedPriceRanges={selectedPriceRanges} 
          selectedRating={selectedRating} 
          selectedEstablishmentTypes={selectedEstablishmentTypes} 
          selectedDietTypes={selectedDietTypes} 
          selectedSort={selectedSort}
          selectedTimeRanges={selectedTimeRanges}
          isOpenNow={isOpenNow} 
          onClearFilter={handleClearFilter}
          onSortChange={setSelectedSort}
          onDistanceChange={setSelectedDistance}
          onPriceRangeChange={setSelectedPriceRanges}
          onRatingChange={setSelectedRating}
          onEstablishmentTypeChange={setSelectedEstablishmentTypes}
          onDietTypeChange={setSelectedDietTypes}
          onTimeRangeChange={setSelectedTimeRanges}
          onOpenNowChange={(value: boolean) => setIsOpenNow(value)}
        />

        {/* Results Header with adjusted spacing */}
        <div className="flex items-center justify-between mb-3 mt-3">
          <div>
            <h2 className="text-sm font-medium mb-1 text-muted-foreground">
              {restaurantsLoading ? 'Cargando...' : `${restaurants.length} resultados`}
            </h2>
            {restaurantsError && <p className="text-sm text-destructive mt-1">Error: {restaurantsError}</p>}
          </div>
          <ResetFiltersButton 
            hasActiveFilters={hasActiveFilters} 
            onClearAll={() => handleClearFilter('all')} 
          />
        </div>

        {/* Restaurant Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {restaurantsLoading ? Array.from({
          length: 12
        }).map((_, i) => <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>) : restaurantsError ? <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Error al cargar restaurantes: {restaurantsError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Revisa la consola para más detalles
              </p>
            </div> : restaurants.length === 0 ? <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No se encontraron restaurantes</p>
              <p className="text-sm text-muted-foreground mt-2">
                Intenta cambiar los filtros de búsqueda
              </p>
            </div> : restaurants.map(restaurant => <RestaurantCard key={restaurant.id} id={restaurant.id} name={restaurant.name} slug={restaurant.slug} description={restaurant.description} priceRange={restaurant.price_range} googleRating={restaurant.google_rating} distance={restaurant.distance_km} cuisineTypes={restaurant.cuisine_types} establishmentType={restaurant.establishment_type} services={restaurant.services} favoritesCount={restaurant.favorites_count} coverImageUrl={restaurant.cover_image_url} logoUrl={restaurant.logo_url} onLoginRequired={handleLoginRequired} />)}
        </div>
      </>;
  };

  return <div className="min-h-screen bg-white pb-20">
      {/* Header - Full width */}
      <header className="sticky top-0 z-50 bg-white">
        <div className="px-4 md:px-6 lg:px-8 xl:px-12">
          {renderHeader()}
        </div>

        {/* Content wrapper with larger desktop margins */}
        <div className="px-4 md:px-6 lg:px-24 xl:px-32 2xl:px-48">
          {/* Tipos de Cocina / Tipos de Comida */}
          <div className="pb-2 pt-0">
            {activeBottomTab === 'dishes' ? <FoodTypeFilter selectedFoodTypes={selectedFoodTypes} onFoodTypeChange={setSelectedFoodTypes} /> : <CuisineFilter selectedCuisines={selectedCuisines} onCuisineChange={setSelectedCuisines} />}
          </div>

          {/* Search bar for mobile - Full width below cuisine types with doubled spacing */}
          {isMobile && <div className="pb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 z-10" style={{
              color: '#4B4B4B'
            }} />
                <input type="text" placeholder={getSearchPlaceholder()} value={getCurrentSearchQuery()} onChange={e => setCurrentSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="w-full pl-10 pr-4 h-10 text-base rounded-full border-0 focus:outline-none focus:ring-0 placeholder:text-[#4B4B4B]" style={{
              backgroundColor: '#F3F3F3',
              color: '#4B4B4B'
            }} />
              </div>
            </div>}
        </div>
      </header>

      {/* Main Content with desktop margins */}
      <div className="w-full px-4 md:px-6 lg:px-24 xl:px-32 2xl:px-48">
        <div className="p-0 md:p-4">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Full width */}
      <BottomNavigation activeTab={activeBottomTab} onTabChange={handleBottomTabChange} />

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <MenuModal open={menuModalOpen} onOpenChange={setMenuModalOpen} />

      <LocationModal open={locationModalOpen} onOpenChange={setLocationModalOpen} onLocationSelect={handleLocationSelect} />
    </div>;
}
