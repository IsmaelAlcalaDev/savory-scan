import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useDisclosure } from '@mantine/hooks';
import { Drawer } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useMapStore } from '@/stores/mapStore';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useRestaurantDishes } from '@/hooks/useRestaurantDishes';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useSettingsStore } from '@/stores/settingsStore';
import { IconAdjustmentsAlt, IconMap, IconSearch } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import RestaurantList from '@/components/RestaurantList';
import DishList from '@/components/DishList';
import MapComponent from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';
import FilterSidebar from '@/components/FilterSidebar';
import { cn } from '@/lib/utils';
import { DEFAULT_USER_LOCATION } from '@/constants';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">(initialTab || "restaurants");
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSearchBarFocused, setIsSearchBarFocused] = useState(false);
  const [isFilterOpen, { open: openFilter, close: closeFilter }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userLocation, loading: locationLoading, error: locationError } = useUserLocation();
  const { setCenter } = useMapStore();
  const { maxDistance } = useSettingsStore();

  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');
  const initialSearch = searchParams.get('search');

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError
  } = useRestaurants({
    searchQuery: debouncedSearch,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: maxDistance
  });

  const {
    dishes,
    loading: dishesLoading,
    error: dishesError
  } = useRestaurantDishes({
    searchQuery: debouncedSearch,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance: maxDistance
  });

  const appLogoUrl = '/logo.svg';

  // Cargar ubicación guardada o solicitar GPS
  useEffect(() => {
    if (initialLat && initialLng) {
      const lat = parseFloat(initialLat);
      const lng = parseFloat(initialLng);

      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('FoodieSpot: Initial coordinates from URL:', { lat, lng });
        setCenter({ latitude: lat, longitude: lng });
      } else {
        console.warn('FoodieSpot: Invalid lat/lng in URL:', { initialLat, initialLng });
      }
    } else if (userLocation) {
      // Si no hay coordenadas en la URL, usa la ubicación del usuario
      console.log('FoodieSpot: Using user location:', userLocation);
      setCenter({ latitude: userLocation.latitude, longitude: userLocation.longitude });
    } else {
      // Si no hay ubicación del usuario, usa la ubicación por defecto
      console.log('FoodieSpot: Using default location:', DEFAULT_USER_LOCATION);
      setCenter(DEFAULT_USER_LOCATION);
    }
  }, [initialLat, initialLng, setCenter, userLocation]);

  // Cargar búsqueda inicial desde la URL
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Actualizar la URL cuando cambia la búsqueda
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [search, searchParams, router]);

  const handleTabChange = useCallback((tab: "restaurants" | "dishes") => {
    setActiveTab(tab);
  }, []);

  const toggleMapVisibility = () => {
    setIsMapVisible((prev) => !prev);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const getResultsText = () => {
    const count = activeTab === 'dishes' ? dishes.length : restaurants.length;
    
    // For dishes tab
    if (activeTab === 'dishes') {
      if (userLocation) {
        return `${count} platos cerca de ti`;
      } else {
        return `${count} platos en España`;
      }
    }
    
    // For restaurants tab - always use "establecimientos"
    if (userLocation) {
      return `${count} establecimientos cerca de ti`;
    } else {
      return `${count} establecimientos en España`;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img src={appLogoUrl} alt="FoodieSpot Logo" className="h-8 w-auto mr-4" />
          <h1 className="text-lg font-semibold">FoodieSpot</h1>
        </div>

        <div className="flex items-center space-x-4">
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchBarFocused(true)}
            onBlur={() => setIsSearchBarFocused(false)}
          />
          <button onClick={openFilter} className="p-2 rounded-md hover:bg-gray-100">
            <IconAdjustmentsAlt size={20} />
          </button>
          <button onClick={toggleMapVisibility} className="p-2 rounded-md hover:bg-gray-100">
            <IconMap size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar (conditionally rendered) */}
        {!isMobile && (
          <aside className="w-80 border-r overflow-y-auto">
            <FilterSidebar onClose={closeFilter} />
          </aside>
        )}

        {/* Content Area */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Map (conditionally rendered) */}
          {isMapVisible && (
            <div className="h-96 w-full">
              {locationLoading ? (
                <Skeleton className="w-full h-full" />
              ) : locationError ? (
                <div className="text-red-500">Error al cargar la ubicación.</div>
              ) : (
                <MapComponent restaurants={restaurants} dishes={dishes} activeTab={activeTab} />
              )}
            </div>
          )}

          {/* Tabs and Results */}
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <Tabs.List>
                <Tabs.Trigger value="restaurants">Establecimientos</Tabs.Trigger>
                <Tabs.Trigger value="dishes">Platos</Tabs.Trigger>
              </Tabs.List>
            </Tabs>
            <p className="mt-2 text-sm text-gray-500">{getResultsText()}</p>
          </div>

          {/* List of Restaurants/Dishes */}
          <div className="flex-grow overflow-y-auto">
            {activeTab === "restaurants" ? (
              restaurantsLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : restaurantsError ? (
                <div className="p-4 text-red-500">Error al cargar los establecimientos.</div>
              ) : (
                <RestaurantList restaurants={restaurants} />
              )
            ) : (
              dishesLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : dishesError ? (
                <div className="p-4 text-red-500">Error al cargar los platos.</div>
              ) : (
                <DishList dishes={dishes} />
              )
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        opened={isFilterOpen}
        onClose={closeFilter}
        title="Filtrar"
        padding="xl"
        size="full"
        position="bottom"
      >
        <FilterSidebar onClose={closeFilter} />
      </Drawer>
    </div>
  );
}
