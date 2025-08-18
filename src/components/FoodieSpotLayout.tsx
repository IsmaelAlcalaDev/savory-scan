import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import CuisineFilter from './CuisineFilter';
import FoodTypeFilter from './FoodTypeFilter';
import RestaurantCard from './RestaurantCard';
import AllDishCard from './AllDishCard';
import LocationModal from './LocationModal';
import BottomNavigation from './BottomNavigation';
import AccountModal from './AccountModal';
import MenuModal from './MenuModal';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletHeader';
import DesktopHeader from './DesktopHeader';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';
import DishesWithSort from './DishesWithSort';
import FilterTags, { ResetFiltersButton } from './FilterTags';
import UnifiedRestaurantsTab from './UnifiedRestaurantsTab';
import type { Restaurant } from '@/types/restaurant';

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
  const { user } = useAuth();
  
  // Separate search states for each tab
  const [searchQueryRestaurants, setSearchQueryRestaurants] = useState('');
  const [searchQueryDishes, setSearchQueryDishes] = useState('');
  
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);

  // Estados para filtros
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isHighRated, setIsHighRated] = useState(false);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Selecciona ubicación');
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Add new states for quick filters
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);

  // Determine active tab based on current route
  const getActiveTabFromRoute = (): 'restaurants' | 'dishes' | 'account' => {
    if (location.pathname === '/platos') return 'dishes';
    if (location.pathname === '/restaurantes' || location.pathname === '/') return 'restaurants';
    if (location.pathname === '/account') return 'account';
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

  const handleClearFilter = (type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'customTags' | 'openNow' | 'budgetFriendly' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisines([]);
        break;
      case 'foodType':
        setSelectedFoodTypes([]);
        break;
      case 'price':
        setSelectedPriceRanges([]);
        break;
      case 'highRated':
        setIsHighRated(false);
        break;
      case 'establishment':
        setSelectedEstablishmentTypes([]);
        break;
      case 'diet':
        setSelectedDietTypes([]);
        break;
      case 'customTags':
        setSelectedCustomTags([]);
        break;
      case 'openNow':
        setIsOpenNow(!isOpenNow);
        break;
      case 'budgetFriendly':
        setIsBudgetFriendly(false);
        break;
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedPriceRanges([]);
        setIsHighRated(false);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setSelectedCustomTags([]);
        setIsOpenNow(false);
        setIsBudgetFriendly(false);
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

  const getResultsText = (count: number, loading: boolean) => {
    if (loading) return 'Cargando...';
    
    if (activeBottomTab === 'dishes') {
      if (userLocation) {
        return `${count} platos cerca de ti`;
      } else {
        return `${count} platos en España`;
      }
    }
    
    // For restaurants tab
    if (selectedEstablishmentTypes.length === 1) {
      // Find the establishment type name
      // For now, use generic text since we don't have establishment type names loaded
      if (userLocation) {
        return `${count} establecimientos cerca de ti`;
      } else {
        return `${count} establecimientos en España`;
      }
    } else if (selectedEstablishmentTypes.length > 1) {
      if (userLocation) {
        return `${count} establecimientos cerca de ti`;
      } else {
        return `${count} establecimientos en España`;
      }
    } else {
      if (userLocation) {
        return `${count} restaurantes cerca de ti`;
      } else {
        return `${count} restaurantes en España`;
      }
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
    maxDistance: 1000, // Increased to 1000km to cover all of Spain
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    priceRanges: selectedPriceRanges.length > 0 ? selectedPriceRanges as ('€' | '€€' | '€€€' | '€€€€')[] : undefined,
    isHighRated: isHighRated,
    selectedEstablishmentTypes: selectedEstablishmentTypes.length > 0 ? selectedEstablishmentTypes : undefined,
    selectedDietTypes: selectedDietTypes.length > 0 ? selectedDietTypes : undefined,
    isOpenNow: isOpenNow,
    isBudgetFriendly: isBudgetFriendly
  });
  
  const {
    dishes,
    loading: dishesLoading,
    error: dishesError
  } = useDishes({
    searchQuery: searchQueryDishes,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    maxDistance: 1000, // Also increased for dishes
    selectedFoodTypes,
    selectedDietTypes: selectedDietTypes.length > 0 ? selectedDietTypes : undefined,
    selectedCustomTags: selectedCustomTags.length > 0 ? selectedCustomTags : undefined,
    spiceLevels: []
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
      if (user) {
        // If user is authenticated, navigate to account page
        setActiveBottomTab('account');
        navigate('/account', { replace: true });
      } else {
        // If user is not authenticated, open the account modal
        setAccountModalOpen(true);
      }
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
    setAccountModalOpen(true);
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
      return <TabletHeader appName={appName} appLogoUrl={appLogoUrl} currentLocationName={currentLocationName} isLoadingLocation={isLoadingLocation} searchQuery={getCurrentSearchQuery()} searchPlaceholder={getSearchPlaceholder()} isSearchFocused={isSearchFocused} onLogoClick={() => navigate('/restaurantes')} onLocationClick={() => setLocationModalOpen(true)} onMenuClick={() => setMenuModalOpen(true)} onAccountClick={() => setAccountModalOpen(true)} onSearchChange={setCurrentSearchQuery} onSearchFocus={() => setIsSearchFocused(true)} onSearchBlur={() => setIsSearchFocused(false)} />;
    } else {
      // Desktop
      return <DesktopHeader appName={appName} appLogoUrl={appLogoUrl} currentLocationName={currentLocationName} isLoadingLocation={isLoadingLocation} searchQuery={getCurrentSearchQuery()} searchPlaceholder={getSearchPlaceholder()} isSearchFocused={isSearchFocused} onLogoClick={() => navigate('/restaurantes')} onLocationClick={() => setLocationModalOpen(true)} onMenuClick={() => setMenuModalOpen(true)} onAccountClick={() => setAccountModalOpen(true)} onSearchChange={setCurrentSearchQuery} onSearchFocus={() => setIsSearchFocused(true)} onSearchBlur={() => setIsSearchFocused(false)} />;
    }
  };

  const renderContent = () => {
    const hasActiveFilters: boolean = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedPriceRanges.length > 0 || 
    isHighRated || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 || 
    selectedCustomTags.length > 0 ||
    isOpenNow ||
    isBudgetFriendly;

    if (activeBottomTab === 'account') {
      // Show account content directly when authenticated and on account tab
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Mi Cuenta</h2>
            <p className="text-muted-foreground">Contenido de la cuenta del usuario</p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{user.email}</p>
                {user.user_metadata?.full_name && (
                  <p className="text-sm text-gray-600">{user.user_metadata.full_name}</p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeBottomTab === 'dishes') {
      return (
        <DishesWithSort
          searchQuery={searchQueryDishes}
          userLocation={userLocation}
          selectedFoodTypes={selectedFoodTypes}
          selectedDietTypes={selectedDietTypes}
          selectedCustomTags={selectedCustomTags}
          hasActiveFilters={hasActiveFilters}
          onClearAll={() => handleClearFilter('all')}
        />
      );
    }

    // Default restaurants content
    return (
      <UnifiedRestaurantsTab
        searchQuery={searchQueryRestaurants}
        userLocation={userLocation}
        selectedCuisines={selectedCuisines}
        selectedPriceRanges={selectedPriceRanges}
        isHighRated={isHighRated}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        selectedDietTypes={selectedDietTypes}
        isOpenNow={isOpenNow}
        isBudgetFriendly={isBudgetFriendly}
        hasActiveFilters={hasActiveFilters}
        onClearAll={() => handleClearFilter('all')}
        onLoginRequired={() => setAccountModalOpen(true)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header - Only the navigation is sticky */}
      {activeBottomTab !== 'account' && (
        <header className="sticky top-0 z-50 bg-white">
          <div className="px-2">
            {renderHeader()}
          </div>
        </header>
      )}

      {/* Main Content with desktop margins */}
      <div className="w-full px-4 md:px-6 lg:px-24 xl:px-32 2xl:px-48">
        {/* Tipos de Cocina / Tipos de Comida - Now in scrollable content */}
        {activeBottomTab !== 'account' && (
          <div className="pb-2 pt-4">
            {activeBottomTab === 'dishes' ? (
              <FoodTypeFilter selectedFoodTypes={selectedFoodTypes} onFoodTypeChange={setSelectedFoodTypes} />
            ) : (
              <CuisineFilter selectedCuisines={selectedCuisines} onCuisineChange={setSelectedCuisines} />
            )}
          </div>
        )}

        {/* Search bar for mobile - Full width below cuisine types with doubled spacing */}
        {isMobile && activeBottomTab !== 'account' && (
          <div className="pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 z-10 text-black" />
              <input
                type="text"
                placeholder={activeBottomTab === 'dishes' ? 'Buscar platos...' : 'Buscar restaurantes...'}
                value={activeBottomTab === 'dishes' ? searchQueryDishes : searchQueryRestaurants}
                onChange={e => activeBottomTab === 'dishes' ? setSearchQueryDishes(e.target.value) : setSearchQueryRestaurants(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 h-10 text-base rounded-full border-0 focus:outline-none focus:ring-0 text-black placeholder:text-black"
                style={{
                  backgroundColor: 'rgb(243, 243, 243)'
                }}
              />
            </div>
          </div>
        )}

        <div className="p-0 md:p-4">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation - Full width */}
      <BottomNavigation activeTab={activeBottomTab} onTabChange={handleBottomTabChange} />

      {/* Modals */}
      <AccountModal open={accountModalOpen} onOpenChange={setAccountModalOpen} />

      <MenuModal open={menuModalOpen} onOpenChange={setMenuModalOpen} />

      <LocationModal open={locationModalOpen} onOpenChange={setLocationModalOpen} onLocationSelect={handleLocationSelect} />
    </div>
  );
}
