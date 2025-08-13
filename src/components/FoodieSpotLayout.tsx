
import { useState, useEffect } from 'react';
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useLocation } from '@/hooks/useLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useFilterValidation } from '@/hooks/useFilterValidation';
import SearchBar from './SearchBar';
import CuisineFilter from './CuisineFilter';
import DistanceFilter from './DistanceFilter';
import RatingFilter from './RatingFilter';
import FoodTypeFilter from './FoodTypeFilter';
import FiltersModal from './FiltersModal';
import DishesFiltersModal from './DishesFiltersModal';
import RestaurantList from './RestaurantList';
import DishList from './DishList';
import BottomNavigation from './BottomNavigation';
import FilterConflictAlert from './FilterConflictAlert';
import { Tabs, TabsContent } from '@/components/ui/tabs';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { location } = useLocation();
  const { validateFilters, conflicts } = useFilterValidation();
  
  // Determine active tab from current route
  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes'>(() => {
    if (routerLocation.pathname === '/platos') return 'dishes';
    return 'restaurants';
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick filters state
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);

  // Restaurant modal filters state
  const [selectedEstablishments, setSelectedEstablishments] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [selectedRestaurantPriceRanges, setSelectedRestaurantPriceRanges] = useState<string[]>([]);
  const [selectedRestaurantDietTypes, setSelectedRestaurantDietTypes] = useState<string[]>([]);

  // Dish modal filters state
  const [selectedDishPriceRanges, setSelectedDishPriceRanges] = useState<string[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedPrepTimeRanges, setSelectedPrepTimeRanges] = useState<number[]>([]);

  // Sync tab with route
  useEffect(() => {
    if (routerLocation.pathname === '/platos') {
      setActiveBottomTab('dishes');
    } else if (routerLocation.pathname === '/restaurantes') {
      setActiveBottomTab('restaurants');
    }
  }, [routerLocation.pathname]);

  // Convert distance filter to maxDistance for useRestaurants
  const maxDistance = selectedDistances.length > 0 ? Math.max(...selectedDistances) : 50;

  // Convert rating filter to minRating for useRestaurants
  const minRating = selectedRatings.length > 0 ? Math.min(...selectedRatings) : 0;

  // Convert price ranges for useRestaurants
  const restaurantPriceRanges = selectedRestaurantPriceRanges.length > 0 ? selectedRestaurantPriceRanges as ('€' | '€€' | '€€€' | '€€€€')[] : undefined;

  // Fetch data with filters
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    maxDistance,
    cuisineTypeIds: selectedCuisines,
    priceRanges: restaurantPriceRanges,
    minRating,
    serviceIds: selectedServices,
    timeRangeIds: selectedTimeRanges,
    dietTypes: selectedRestaurantDietTypes
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    selectedDietTypes: selectedDishDietTypes,
    selectedPriceRanges: selectedDishPriceRanges,
    selectedFoodTypes,
    spiceLevels: selectedSpiceLevels,
    prepTimeRanges: selectedPrepTimeRanges
  });

  // Handle filter changes with validation
  const handleCuisineChange = (cuisines: number[]) => {
    const currentFilters = {
      cuisines: selectedCuisines,
      dietTypes: activeBottomTab === 'restaurants' ? selectedRestaurantDietTypes : selectedDishDietTypes,
      priceRanges: activeBottomTab === 'restaurants' ? selectedRestaurantPriceRanges : selectedDishPriceRanges,
      establishments: selectedEstablishments
    };

    validateFilters('cuisines', cuisines, currentFilters);
    setSelectedCuisines(cuisines);
  };

  const handleDietTypeChange = (dietTypes: string[]) => {
    const currentFilters = {
      cuisines: selectedCuisines,
      dietTypes: activeBottomTab === 'restaurants' ? selectedRestaurantDietTypes : selectedDishDietTypes,
      priceRanges: activeBottomTab === 'restaurants' ? selectedRestaurantPriceRanges : selectedDishPriceRanges,
      establishments: selectedEstablishments
    };

    validateFilters('dietTypes', dietTypes, currentFilters);
    
    if (activeBottomTab === 'restaurants') {
      setSelectedRestaurantDietTypes(dietTypes);
    } else {
      setSelectedDishDietTypes(dietTypes);
    }
  };

  const handlePriceRangeChange = (priceRanges: string[]) => {
    const currentFilters = {
      cuisines: selectedCuisines,
      dietTypes: activeBottomTab === 'restaurants' ? selectedRestaurantDietTypes : selectedDishDietTypes,
      priceRanges: activeBottomTab === 'restaurants' ? selectedRestaurantPriceRanges : selectedDishPriceRanges,
      establishments: selectedEstablishments
    };

    validateFilters('priceRanges', priceRanges, currentFilters);
    
    if (activeBottomTab === 'restaurants') {
      setSelectedRestaurantPriceRanges(priceRanges);
    } else {
      setSelectedDishPriceRanges(priceRanges);
    }
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedCuisines([]);
    setSelectedDistances([]);
    setSelectedRatings([]);
    setSelectedFoodTypes([]);
    setSelectedEstablishments([]);
    setSelectedServices([]);
    setSelectedTimeRanges([]);
    setSelectedRestaurantPriceRanges([]);
    setSelectedRestaurantDietTypes([]);
    setSelectedDishPriceRanges([]);
    setSelectedDishDietTypes([]);
    setSelectedSpiceLevels([]);
    setSelectedPrepTimeRanges([]);
  };

  const handleBottomTabChange = (value: string) => {
    const newTab = value as 'restaurants' | 'dishes';
    setActiveBottomTab(newTab);
    
    if (newTab === 'restaurants') {
      navigate('/restaurantes');
    } else if (newTab === 'dishes') {
      navigate('/platos');
    }
  };

  const handleLogoClick = () => {
    navigate('/restaurantes');
    setActiveBottomTab('restaurants');
  };

  const handleSearch = (query: string, location?: string) => {
    setSearchQuery(query);
    console.log('Search:', query, 'Location:', location);
  };

  // Calculate total active filters
  const totalActiveFilters = selectedCuisines.length + 
    selectedDistances.length + 
    selectedRatings.length + 
    selectedFoodTypes.length + 
    selectedEstablishments.length + 
    selectedServices.length + 
    selectedTimeRanges.length + 
    selectedRestaurantPriceRanges.length + 
    selectedRestaurantDietTypes.length + 
    selectedDishPriceRanges.length + 
    selectedDishDietTypes.length + 
    selectedSpiceLevels.length + 
    selectedPrepTimeRanges.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Filter Conflict Alert */}
      {conflicts.length > 0 && (
        <FilterConflictAlert conflicts={conflicts} />
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">FoodieSpot</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {activeBottomTab === 'restaurants' ? (
              <FiltersModal
                selectedDistances={selectedDistances}
                onDistanceChange={setSelectedDistances}
                selectedRatings={selectedRatings}
                onRatingChange={setSelectedRatings}
                selectedEstablishments={selectedEstablishments}
                onEstablishmentChange={setSelectedEstablishments}
                selectedServices={selectedServices}
                onServiceChange={setSelectedServices}
                selectedPriceRanges={selectedRestaurantPriceRanges}
                onPriceRangeChange={handlePriceRangeChange}
                selectedTimeRanges={selectedTimeRanges}
                onTimeRangeChange={setSelectedTimeRanges}
                selectedDietTypes={selectedRestaurantDietTypes}
                onDietTypeChange={handleDietTypeChange}
              />
            ) : (
              <DishesFiltersModal
                selectedDistances={selectedDistances}
                onDistanceChange={setSelectedDistances}
                selectedPriceRanges={selectedDishPriceRanges}
                onPriceRangeChange={handlePriceRangeChange}
                selectedDietTypes={selectedDishDietTypes}
                onDietTypeChange={handleDietTypeChange}
                selectedSpiceLevels={selectedSpiceLevels}
                onSpiceLevelChange={setSelectedSpiceLevels}
                selectedPrepTimeRanges={selectedPrepTimeRanges}
                onPrepTimeRangeChange={setSelectedPrepTimeRanges}
              />
            )}
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder={activeBottomTab === 'restaurants' ? "Buscar restaurantes..." : "Buscar platos..."}
        />
      </header>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-4">
        {/* Cuisine Types Filter */}
        <div className="px-4 mb-4">
          <CuisineFilter
            selectedCuisines={selectedCuisines}
            onCuisineChange={handleCuisineChange}
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex gap-4 px-4 overflow-x-auto pb-2">
          <DistanceFilter
            selectedDistances={selectedDistances}
            onDistanceChange={setSelectedDistances}
          />
          
          {activeBottomTab === 'restaurants' && (
            <RatingFilter
              selectedRatings={selectedRatings}
              onRatingChange={setSelectedRatings}
            />
          )}
          
          {activeBottomTab === 'dishes' && (
            <FoodTypeFilter
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypeChange={setSelectedFoodTypes}
            />
          )}
        </div>

        {/* Active filters summary */}
        {totalActiveFilters > 0 && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Filtros activos: {totalActiveFilters}
              </span>
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeBottomTab} onValueChange={handleBottomTabChange} className="flex-1">
        <TabsContent value="restaurants" className="mt-0 p-4">
          <RestaurantList
            restaurants={restaurants}
            loading={restaurantsLoading}
            error={restaurantsError}
          />
        </TabsContent>

        <TabsContent value="dishes" className="mt-0 p-4">
          <DishList
            dishes={dishes}
            loading={dishesLoading}
            error={dishesError}
          />
        </TabsContent>
      </Tabs>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeBottomTab}
        onTabChange={handleBottomTabChange}
      />
    </div>
  );
}
