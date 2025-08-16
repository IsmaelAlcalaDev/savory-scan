import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletHeader';
import BottomNavigation from './BottomNavigation';
import RestaurantCard from './RestaurantCard';
import DishCard from './DishCard';
import SearchBar from './SearchBar';
import DishSearchBar from './DishSearchBar';
import UnifiedFiltersModal from './UnifiedFiltersModal';
import LocationModal from './LocationModal';
import MenuModal from './MenuModal';
import AuthModal from './AuthModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Filter, Utensils, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import ViewModeToggle from './ViewModeToggle';
import FilterTags from './FilterTags';
import { useIPLocation } from '@/hooks/useIPLocation';
import DishesGrid from './DishesGrid';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL params
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'dishes' || tabParam === 'restaurants') {
      return tabParam;
    }
    return initialTab;
  };
  
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const { location: ipLocation, loading: ipLoading } = useIPLocation();
  
  // Filter states
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedDistanceRanges, setSelectedDistanceRanges] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isHighRated, setIsHighRated] = useState(false);
  
  // Dish-specific filter states
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<number[]>([]);
  const [selectedDishPriceRanges, setSelectedDishPriceRanges] = useState<string[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedPrepTimeRanges, setSelectedPrepTimeRanges] = useState<number[]>([]);

  // Hooks for data fetching
  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError 
  } = useRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisineTypes,
    priceRanges: selectedPriceRanges,
    isHighRated,
    selectedDistanceRangeIds: selectedDistanceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedTimeRanges,
    isOpenNow
  });

  const { 
    dishes, 
    loading: dishesLoading, 
    error: dishesError 
  } = useDishes({
    searchQuery: dishSearchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedDietTypes: selectedDishDietTypes,
    selectedPriceRanges: selectedDishPriceRanges,
    selectedFoodTypes,
    spiceLevels,
    prepTimeRanges: selectedPrepTimeRanges
  });

  useEffect(() => {
    if (ipLocation && !userLocation && !ipLoading) {
      setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
      setLocationName(ipLocation.city || 'Tu ubicación');
    }
  }, [ipLocation, userLocation, ipLoading]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (activeTab !== 'restaurants') {
      newSearchParams.set('tab', activeTab);
    }
    if (searchQuery) {
      newSearchParams.set('search', searchQuery);
    }
    
    const newUrl = newSearchParams.toString();
    const currentUrl = searchParams.toString();
    
    if (newUrl !== currentUrl) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [activeTab, searchQuery, setSearchParams]);

  const handleLocationSelect = (location: { lat: number; lng: number }, name: string) => {
    setUserLocation(location);
    setLocationName(name);
    setIsLocationModalOpen(false);
  };

  const handleTabChange = (value: string) => {
    if (value === 'restaurants' || value === 'dishes') {
      setActiveTab(value);
    }
  };

  const clearAllFilters = () => {
    if (activeTab === 'restaurants') {
      setSelectedCuisineTypes([]);
      setSelectedPriceRanges([]);
      setSelectedDistanceRanges([]);
      setSelectedEstablishmentTypes([]);
      setSelectedDietTypes([]);
      setSelectedTimeRanges([]);
      setIsOpenNow(false);
      setIsHighRated(false);
      setSearchQuery('');
    } else {
      setSelectedDishDietTypes([]);
      setSelectedDishPriceRanges([]);
      setSelectedFoodTypes([]);
      setSelectedSpiceLevels([]);
      setSelectedPrepTimeRanges([]);
      setDishSearchQuery('');
    }
  };

  const getActiveFiltersCount = () => {
    if (activeTab === 'restaurants') {
      return selectedCuisineTypes.length + 
             selectedPriceRanges.length + 
             selectedDistanceRanges.length + 
             selectedEstablishmentTypes.length + 
             selectedDietTypes.length + 
             selectedTimeRanges.length +
             (isOpenNow ? 1 : 0) +
             (isHighRated ? 1 : 0) +
             (searchQuery ? 1 : 0);
    } else {
      return selectedDishDietTypes.length + 
             selectedDishPriceRanges.length + 
             selectedFoodTypes.length + 
             selectedSpiceLevels.length + 
             selectedPrepTimeRanges.length +
             (dishSearchQuery ? 1 : 0);
    }
  };

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Headers */}
      <div className="hidden lg:block">
        <DesktopHeader 
          onLocationClick={() => setIsLocationModalOpen(true)}
          onAuthClick={() => setIsAuthModalOpen(true)}
          locationName={locationName}
        />
      </div>
      
      <div className="hidden md:block lg:hidden">
        <TabletHeader 
          onLocationClick={() => setIsLocationModalOpen(true)}
          onAuthClick={() => setIsAuthModalOpen(true)}
          locationName={locationName}
        />
      </div>
      
      <div className="block md:hidden">
        <MobileHeader 
          onLocationClick={() => setIsLocationModalOpen(true)}
          onMenuClick={() => setIsMenuModalOpen(true)}
          locationName={locationName}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="restaurants" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  <span className="hidden sm:inline">Restaurantes</span>
                  <span className="sm:hidden">Rest.</span>
                </TabsTrigger>
                <TabsTrigger value="dishes" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Platos</span>
                  <span className="sm:hidden">Platos</span>
                </TabsTrigger>
              </TabsList>
              
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                {activeTab === 'restaurants' ? (
                  <SearchBar 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Buscar restaurantes..."
                  />
                ) : (
                  <DishSearchBar 
                    value={dishSearchQuery}
                    onChange={setDishSearchQuery}
                    placeholder="Buscar platos..."
                  />
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setIsFiltersOpen(true)}
                className={cn(
                  "flex items-center gap-2 shrink-0",
                  hasActiveFilters && "border-primary text-primary"
                )}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Filter Tags */}
            {hasActiveFilters && (
              <FilterTags
                activeTab={activeTab}
                selectedCuisineTypes={selectedCuisineTypes}
                selectedPriceRanges={selectedPriceRanges}
                selectedDistanceRanges={selectedDistanceRanges}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietTypes={selectedDietTypes}
                selectedTimeRanges={selectedTimeRanges}
                isOpenNow={isOpenNow}
                isHighRated={isHighRated}
                searchQuery={searchQuery}
                selectedDishDietTypes={selectedDishDietTypes}
                selectedDishPriceRanges={selectedDishPriceRanges}
                selectedFoodTypes={selectedFoodTypes}
                selectedSpiceLevels={selectedSpiceLevels}
                selectedPrepTimeRanges={selectedPrepTimeRanges}
                dishSearchQuery={dishSearchQuery}
                onClearAll={clearAllFilters}
                setSelectedCuisineTypes={setSelectedCuisineTypes}
                setSelectedPriceRanges={setSelectedPriceRanges}
                setSelectedDistanceRanges={setSelectedDistanceRanges}
                setSelectedEstablishmentTypes={setSelectedEstablishmentTypes}
                setSelectedDietTypes={setSelectedDietTypes}
                setSelectedTimeRanges={setSelectedTimeRanges}
                setIsOpenNow={setIsOpenNow}
                setIsHighRated={setIsHighRated}
                setSearchQuery={setSearchQuery}
                setSelectedDishDietTypes={setSelectedDishDietTypes}
                setSelectedDishPriceRanges={setSelectedDishPriceRanges}
                setSelectedFoodTypes={setSelectedFoodTypes}
                setSelectedSpiceLevels={setSelectedSpiceLevels}
                setSelectedPrepTimeRanges={setSelectedPrepTimeRanges}
                setDishSearchQuery={setDishSearchQuery}
              />
            )}
          </div>

          {/* Tab Content */}
          <TabsContent value="restaurants" className="mt-6">
            {restaurantsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Error: {restaurantsError}</p>
              </div>
            ) : restaurantsLoading ? (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-12">
                <Store className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron restaurantes</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta cambiar los filtros o buscar en otra ubicación
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                "grid gap-6",
                viewMode === 'grid' 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "grid-cols-1"
              )}>
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dishes" className="mt-6">
            <DishesGrid 
              dishes={dishes}
              loading={dishesLoading}
              error={dishesError}
              viewMode={viewMode}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="block md:hidden">
        <BottomNavigation 
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <UnifiedFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeTab={activeTab}
        selectedCuisineTypes={selectedCuisineTypes}
        setSelectedCuisineTypes={setSelectedCuisineTypes}
        selectedPriceRanges={selectedPriceRanges}
        setSelectedPriceRanges={setSelectedPriceRanges}
        selectedDistanceRanges={selectedDistanceRanges}
        setSelectedDistanceRanges={setSelectedDistanceRanges}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        setSelectedEstablishmentTypes={setSelectedEstablishmentTypes}
        selectedDietTypes={selectedDietTypes}
        setSelectedDietTypes={setSelectedDietTypes}
        selectedTimeRanges={selectedTimeRanges}
        setSelectedTimeRanges={setSelectedTimeRanges}
        isOpenNow={isOpenNow}
        setIsOpenNow={setIsOpenNow}
        isHighRated={isHighRated}
        setIsHighRated={setIsHighRated}
        selectedDishDietTypes={selectedDishDietTypes}
        setSelectedDishDietTypes={setSelectedDishDietTypes}
        selectedDishPriceRanges={selectedDishPriceRanges}
        setSelectedDishPriceRanges={setSelectedDishPriceRanges}
        selectedFoodTypes={selectedFoodTypes}
        setSelectedFoodTypes={setSelectedFoodTypes}
        selectedSpiceLevels={selectedSpiceLevels}
        setSelectedSpiceLevels={setSelectedSpiceLevels}
        selectedPrepTimeRanges={selectedPrepTimeRanges}
        setSelectedPrepTimeRanges={setSelectedPrepTimeRanges}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
      />

      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        onAuthClick={() => {
          setIsMenuModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
