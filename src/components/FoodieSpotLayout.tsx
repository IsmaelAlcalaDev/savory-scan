
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import RestaurantCard from '@/components/RestaurantCard';
import DishesGrid from '@/components/DishesGrid';
import SecureSearchBar from '@/components/SecureSearchBar';
import BottomNavigation from '@/components/BottomNavigation';
import { Home, Utensils, Heart, User } from 'lucide-react';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import FilterTags from '@/components/FilterTags';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { getFilterSuggestions } from '@/utils/filterValidation';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

type PriceRange = '€' | '€€' | '€€€' | '€€€€';

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active bottom tab state - only restaurants and dishes
  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes'>(initialTab);

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

  // Mock geolocation (since react-geolocated is not available)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user location using browser API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    navigate(`/?${params.toString()}`, { replace: true });
  }, [searchQuery, navigate, searchParams]);

  // Filter states - separate for restaurants and dishes where needed
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | undefined>();
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState<string | undefined>();
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);

  // Use restaurants hook with all filters
  const restaurantFilters = {
    searchQuery: activeBottomTab === 'restaurants' ? searchQuery : '',
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedCuisines,
    selectedDistance,
    selectedPriceRanges,
    selectedRating,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedSort,
    selectedTimeRanges,
    isOpenNow
  };

  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError,
    filterWarnings: restaurantFilterWarnings
  } = useRestaurants(activeBottomTab === 'restaurants' ? restaurantFilters : {});

  // Use dishes hook with relevant filters
  const dishFilters = {
    searchQuery: activeBottomTab === 'dishes' ? searchQuery : '',
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCuisines,
    selectedDistance,
    selectedRating,
    selectedSort,
    spiceLevels: [], // Add spice level state if needed
    prepTimeRanges: [] // Add prep time state if needed
  };

  const { 
    dishes, 
    loading: dishesLoading, 
    error: dishesError,
    filterWarnings: dishFilterWarnings
  } = useDishes(activeBottomTab === 'dishes' ? dishFilters : {});

  // Get current results and suggestions
  const currentResults = activeBottomTab === 'restaurants' ? restaurants : dishes;
  const currentFilterWarnings = activeBottomTab === 'restaurants' ? restaurantFilterWarnings : dishFilterWarnings;
  const filterSuggestions = getFilterSuggestions(
    {
      selectedCuisines,
      selectedFoodTypes,
      selectedDistance,
      selectedPriceRanges,
      selectedRating,
      selectedEstablishmentTypes,
      selectedDietTypes,
      selectedSort,
      selectedTimeRanges,
      isOpenNow,
      userLat: userLocation?.lat,
      userLng: userLocation?.lng
    },
    currentResults.length
  );

  // Handler for search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handler for price range changes with proper type conversion
  const handlePriceRangeChange = useCallback((ranges: string[]) => {
    const validRanges = ranges.filter((range): range is PriceRange => 
      ['€', '€€', '€€€', '€€€€'].includes(range)
    );
    setSelectedPriceRanges(validRanges);
  }, []);

  // Handler for bottom navigation with proper tab filtering
  const handleTabChange = useCallback((tab: 'restaurants' | 'dishes' | 'account') => {
    // Only handle restaurants and dishes tabs
    if (tab === 'restaurants' || tab === 'dishes') {
      setActiveBottomTab(tab);
    }
  }, []);

  // Filter handlers
  const handleClearFilter = useCallback((type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'sort' | 'timeRange' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        if (id !== undefined) {
          setSelectedCuisines(prev => prev.filter(cuisineId => cuisineId !== id));
        }
        break;
      case 'foodType':
        if (id !== undefined) {
          setSelectedFoodTypes(prev => prev.filter(typeId => typeId !== id));
        }
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
        setIsOpenNow(false);
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
  }, []);

  const handleClearAllFilters = useCallback(() => {
    handleClearFilter('all');
  }, [handleClearFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-center">FoodieSpot</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Filter warnings */}
        {currentFilterWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Avisos de filtros:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {currentFilterWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Filter suggestions */}
        {filterSuggestions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Sugerencias:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {filterSuggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <SecureSearchBar
            onSearch={handleSearch}
            placeholder={activeBottomTab === 'restaurants' ? "Buscar restaurantes..." : "Buscar platos..."}
          />

          {activeBottomTab === 'restaurants' && (
            <CuisineFilter
              selectedCuisines={selectedCuisines}
              onCuisineChange={setSelectedCuisines}
            />
          )}

          {activeBottomTab === 'dishes' && (
            <FoodTypeFilter
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypeChange={setSelectedFoodTypes}
            />
          )}

          <FilterTags
            activeTab={activeBottomTab}
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
            onPriceRangeChange={handlePriceRangeChange}
            onRatingChange={setSelectedRating}
            onEstablishmentTypeChange={setSelectedEstablishmentTypes}
            onDietTypeChange={setSelectedDietTypes}
            onTimeRangeChange={setSelectedTimeRanges}
            onOpenNowChange={setIsOpenNow}
          />
        </div>

        {/* Content based on active tab */}
        {activeBottomTab === 'restaurants' && (
          <div className="space-y-6">
            {restaurantsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : restaurantsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{restaurantsError}</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No se encontraron restaurantes con los filtros seleccionados</p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    description={restaurant.description}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    googleRatingCount={restaurant.google_rating_count}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                    services={restaurant.services}
                    favoritesCount={restaurant.favorites_count}
                    coverImageUrl={restaurant.cover_image_url}
                    logoUrl={restaurant.logo_url}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeBottomTab === 'dishes' && (
          <div className="space-y-6">
            <DishesGrid
              dishes={dishes}
              loading={dishesLoading}
              error={dishesError}
            />
            {!dishesLoading && !dishesError && dishes.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No se encontraron platos con los filtros seleccionados</p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation
        activeTab={activeBottomTab === 'restaurants' ? 'restaurants' : activeBottomTab === 'dishes' ? 'dishes' : 'restaurants'}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
