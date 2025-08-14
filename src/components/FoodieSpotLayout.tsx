
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import RestaurantCard from './RestaurantCard';
import AllDishCard from './AllDishCard';
import BottomNavigation from './BottomNavigation';
import LocationModal from './LocationModal';
import FiltersModal from './FiltersModal';
import DishesFiltersModal from './DishesFiltersModal';
import QuickActionTags from './QuickActionTags';
import ViewModeToggle from './ViewModeToggle';
import CuisineFilter from './CuisineFilter';
import FoodTypeFilter from './FoodTypeFilter';
import FavoritesSection from './FavoritesSection';
import RestaurantFilterTags from './RestaurantFilterTags';
import DishFilterTags from './DishFilterTags';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes' | 'favorites';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [activeBottomTab, setActiveBottomTab] = useState<string>(initialTab);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Restaurant filter states
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);

  // Dishes filter states
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedPrepTimeRanges, setSelectedPrepTimeRanges] = useState<number[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = false; // Simplified for now

  // Get user location from local storage
  const storedLat = typeof window !== 'undefined' ? localStorage.getItem('latitude') : null;
  const storedLng = typeof window !== 'undefined' ? localStorage.getItem('longitude') : null;
  const initialLat = storedLat ? parseFloat(storedLat) : undefined;
  const initialLng = storedLng ? parseFloat(storedLng) : undefined;
  const [userLat, setUserLat] = useState<number | undefined>(initialLat);
  const [userLng, setUserLng] = useState<number | undefined>(initialLng);

  // Fetch restaurants and dishes
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery,
    userLat,
    userLng,
    selectedCuisines,
  });

   const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery,
    userLat,
    userLng,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    spiceLevels: selectedSpiceLevels,
    prepTimeRanges: selectedPrepTimeRanges
  });

  // Update filtered restaurants based on search query and other filters
  const filteredRestaurants = restaurants;
  const filteredDishes = dishes;

  // Function to update URL parameters
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', activeBottomTab);
    navigate(`/?${params.toString()}`);
  }, [activeBottomTab, location.search, navigate]);

  // Set initial tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    if (tabFromUrl && tabFromUrl !== activeBottomTab) {
      setActiveBottomTab(tabFromUrl);
    }
  }, [location.search, activeBottomTab]);

  // Update URL when activeTab changes
  useEffect(() => {
    updateUrlParams();
  }, [activeBottomTab, updateUrlParams]);

  const renderHeader = () => {
    return (
      <>
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Location Pin and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center text-gray-800 hover:text-primary transition-colors mr-4"
            >
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-sm">
                {userLat && userLng ? `Cerca de ti` : 'Seleccionar ubicación'}
              </span>
            </button>
            <span className="font-bold text-xl">FoodieSpot</span>
          </div>

          {/* Search bar for desktop - Hidden on mobile */}
          {!isMobile && (
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 z-10" style={{ color: '#4B4B4B' }} />
              <input
                type="text"
                placeholder="Buscar restaurantes, platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 h-10 text-base rounded-full border-0 focus:outline-none focus:ring-0"
                style={{ 
                  backgroundColor: '#F3F3F3',
                  color: '#4B4B4B'
                }}
              />
            </div>
          )}

          {/* Heart Icon */}
          <button
            onClick={() => setActiveBottomTab('favorites')}
            className="text-gray-800 hover:text-primary transition-colors"
          >
            <Heart className="h-6 w-6" />
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white -mx-2 md:-mx-4 lg:-mx-[7.5%] px-2 md:px-4 lg:px-[7.5%]">
        {renderHeader()}

        {/* Tipos de Cocina / Tipos de Comida */}
        <div className="px-4 pb-2 pt-2">
          {activeBottomTab === 'dishes' ? (
            <FoodTypeFilter 
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypeChange={setSelectedFoodTypes}
            />
          ) : (
            <CuisineFilter 
              selectedCuisines={selectedCuisines}
              onCuisineChange={setSelectedCuisines}
            />
          )}
        </div>

        {/* Search bar for mobile - Full width below cuisine types */}
        {isMobile && (
          <div className="px-4 pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 z-10" style={{ color: '#4B4B4B' }} />
              <input
                type="text"
                placeholder="Buscar restaurantes, platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 h-10 text-base rounded-full border-0 focus:outline-none focus:ring-0"
                style={{ 
                  backgroundColor: '#F3F3F3',
                  color: '#4B4B4B'
                }}
              />
            </div>
          </div>
        )}

        {/* Filter Tags */}
        <div className="border-t border-gray-100">
          {activeBottomTab === 'dishes' ? (
            <DishFilterTags
              selectedDistances={selectedDistances}
              onDistanceChange={setSelectedDistances}
              selectedPriceRanges={selectedPriceRanges}
              onPriceRangeChange={setSelectedPriceRanges}
              selectedDietTypes={selectedDietTypes}
              onDietTypeChange={setSelectedDietTypes}
              selectedSpiceLevels={selectedSpiceLevels}
              onSpiceLevelChange={setSelectedSpiceLevels}
              selectedPrepTimeRanges={selectedPrepTimeRanges}
              onPrepTimeRangeChange={setSelectedPrepTimeRanges}
            />
          ) : (
            <RestaurantFilterTags
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
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-2 md:px-4 lg:px-[7.5%] pb-20 md:pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Quick Action Tags */}
          <QuickActionTags />

          {/* Main Content Area */}
          <div className="flex gap-6">
            {/* Desktop Sidebar - Hidden on mobile and tablet */}
            {!isMobile && !isTablet && (
              <aside className="w-80 flex-shrink-0">
                {activeBottomTab === 'dishes' ? (
                  <div className="flex items-center justify-between mb-4">
                    <DishesFiltersModal
                      selectedDistances={selectedDistances}
                      onDistanceChange={setSelectedDistances}
                      selectedPriceRanges={selectedPriceRanges}
                      onPriceRangeChange={setSelectedPriceRanges}
                      selectedDietTypes={selectedDietTypes}
                      onDietTypeChange={setSelectedDietTypes}
                      selectedSpiceLevels={selectedSpiceLevels}
                      onSpiceLevelChange={setSelectedSpiceLevels}
                      selectedPrepTimeRanges={selectedPrepTimeRanges}
                      onPrepTimeRangeChange={setSelectedPrepTimeRanges}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
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
                )}
              </aside>
            )}

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Mobile and Tablet Filter Button */}
              {(isMobile || isTablet) && (
                <div className="flex items-center justify-between mb-4">
                  {activeBottomTab === 'dishes' ? (
                    <DishesFiltersModal
                      selectedDistances={selectedDistances}
                      onDistanceChange={setSelectedDistances}
                      selectedPriceRanges={selectedPriceRanges}
                      onPriceRangeChange={setSelectedPriceRanges}
                      selectedDietTypes={selectedDietTypes}
                      onDietTypeChange={setSelectedDietTypes}
                      selectedSpiceLevels={selectedSpiceLevels}
                      onSpiceLevelChange={setSelectedSpiceLevels}
                      selectedPrepTimeRanges={selectedPrepTimeRanges}
                      onPrepTimeRangeChange={setSelectedPrepTimeRanges}
                    />
                  ) : (
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
                  )}
                  
                  <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              )}

              {/* Tab Content */}
              {activeBottomTab === 'dishes' ? (
                <AllDishCard />
              ) : activeBottomTab === 'favorites' ? (
                <FavoritesSection />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <LocationModal 
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />

      <BottomNavigation activeTab={activeBottomTab as 'restaurants' | 'dishes' | 'account'} onTabChange={setActiveBottomTab} />
    </div>
  );
}
