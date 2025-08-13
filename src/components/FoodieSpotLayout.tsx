import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from 'usehooks-ts';
import { useGeolocation } from 'usehooks-ts';
import { MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RestaurantCard from '@/components/RestaurantCard';
import DishCard from '@/components/DishCard';
import LocationModal from '@/components/LocationModal';
import DishModal from '@/components/DishModal';
import FiltersModal from '@/components/FiltersModal';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useAllDishes, DishWithRestaurant } from '@/hooks/useAllDishes';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  type: 'gps' | 'manual' | 'city' | 'suggestion';
  address?: string | null;
}

export default function FoodieSpotLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Search Query State
  const initialSearchQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // 2. Location State
  const initialLat = searchParams.get('lat');
  const initialLng = searchParams.get('lng');
  const initialCity = searchParams.get('city');

  const [location, setLocation] = useState<LocationData>({
    latitude: initialLat ? parseFloat(initialLat) : null,
    longitude: initialLng ? parseFloat(initialLng) : null,
    city: initialCity || null,
    type: initialLat && initialLng ? 'manual' : 'city',
  });

  // 3. Filters State
  const [maxDistance, setMaxDistance] = useState<number[]>([]);
  const [minRating, setMinRating] = useState<number[]>([]);
  const [establishmentTypes, setEstablishmentTypes] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);

  // 4. Modals State
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishWithRestaurant | null>(null);

  // 5. Tabs State
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">("restaurants");

  // 6. Geolocation Hook
  const geolocation = useGeolocation();

  // 7. Restaurants Hook
  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
  } = useRestaurants({
    searchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    maxDistance,
    foodTypeIds: selectedFoodTypes,
    priceRanges: selectedPriceRanges as Array<'€' | '€€' | '€€€' | '€€€€'>,
    minRating,
    dietTypes: selectedDietTypes,
    cuisineTypes: selectedCuisines,
  });

  // 8. Dishes Hook
  const {
    dishes: allDishes,
    loading: allDishesLoading,
    error: allDishesError,
  } = useAllDishes({
    searchQuery: debouncedSearchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    maxDistance,
    foodTypeIds: selectedFoodTypes,
    priceRanges: selectedPriceRanges as Array<'€' | '€€' | '€€€' | '€€€€'>,
    minRating,
    dietTypes: selectedDietTypes,
  });

  // Function to update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location?.latitude) params.set('lat', location.latitude.toString());
    if (location?.longitude) params.set('lng', location.longitude.toString());
    if (location?.city) params.set('city', location.city);

    router.push(`/?${params.toString()}`, { scroll: false });
  }, [searchQuery, location, router]);

  // Update URL params on search query change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  // Update location state and URL params when geolocation changes and no manual location is set
  useEffect(() => {
    if (geolocation.loading) return;

    if (geolocation.error) {
      console.error("Geolocation error:", geolocation.error);
      return;
    }

    if (!location.latitude && geolocation.latitude && geolocation.longitude) {
      setLocation({
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        city: location.city || null,
        type: 'gps',
      });
    }
  }, [geolocation.loading, geolocation.error, geolocation.latitude, geolocation.longitude, location.city, location.latitude, updateUrlParams]);

  const handleLocationSelect = (locationData: { type: "gps" | "manual" | "city" | "suggestion"; data?: any }) => {
    setLocation({
      latitude: locationData?.data?.latitude || locationData?.data?.lat || null,
      longitude: locationData?.data?.longitude || locationData?.data?.lng || null,
      city: locationData?.data?.city || locationData?.data?.name || null,
      address: locationData?.data?.address || null,
      type: locationData.type,
    });
    setShowLocationModal(false);
    updateUrlParams();
  };

  const handleDishClick = (dish: DishWithRestaurant) => {
    setSelectedDish(dish);
    setShowDishModal(true);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearchQuery = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container py-4 flex items-center justify-between">
          {/* Location Display and Modal Trigger */}
          <Button variant="outline" onClick={() => setShowLocationModal(true)} className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {location?.city || location?.address || 'Seleccionar ubicación'}
            </span>
          </Button>

          {/* Logo Placeholder */}
          <div className="font-bold text-xl">FoodieSpot</div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 space-y-6 pb-20">
        {/* Search Bar */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Buscar restaurantes o platos..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="rounded-full shadow-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearchQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-4">
          <Tabs defaultValue="restaurants" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 rounded-full shadow-sm border">
              <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full shadow-sm">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full shadow-sm">Platos</TabsTrigger>
            </TabsList>
          </Tabs>

          <FiltersModal
            selectedDistances={maxDistance}
            onDistanceChange={setMaxDistance}
            selectedRatings={minRating}
            onRatingChange={setMinRating}
            selectedEstablishments={establishmentTypes}
            onEstablishmentChange={setEstablishmentTypes}
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

        {/* Cuisine Types Filter */}
        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipos de Cocina</h3>
            <CuisineFilter
              selectedCuisines={selectedCuisines}
              onCuisineChange={setSelectedCuisines}
            />
          </div>
        )}

        {/* Food Types Filter */}
        {activeTab === 'dishes' && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tipos de Comida</h3>
            <FoodTypeFilter
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypeChange={setSelectedFoodTypes}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {activeTab === 'restaurants' ? (
            restaurantsLoading ? (
              <p>Loading restaurants...</p>
            ) : restaurantsError ? (
              <p>Error: {restaurantsError}</p>
            ) : restaurants && restaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <p>No restaurants found.</p>
            )
          ) : (
            allDishesLoading ? (
              <p>Loading dishes...</p>
            ) : allDishesError ? (
              <p>Error: {allDishesError}</p>
            ) : allDishes && allDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    restaurantId={dish.restaurant.id}
                    onDishClick={handleDishClick}
                  />
                ))}
              </div>
            ) : (
              <p>No dishes found.</p>
            )
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
        onLocationSelect={handleLocationSelect}
      />

      {/* Dish Modal */}
      {selectedDish && (
        <DishModal
          dish={selectedDish}
          restaurantId={selectedDish.restaurant.id}
          isOpen={showDishModal}
          onClose={() => {
            setShowDishModal(false);
            setSelectedDish(null);
          }}
        />
      )}

      {/* Filters Modal */}
      

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
