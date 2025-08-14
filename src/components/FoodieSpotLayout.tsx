import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAuthModal } from '@/hooks/useAuthModal';
import SearchBar from './SearchBar';
import RestaurantCard from './RestaurantCard';
import DishCard from './DishCard';
import FiltersSidebar from './FiltersSidebar';
import DishesFiltersSidebar from './DishesFiltersSidebar';
import FiltersModal from './FiltersModal';
import DishesFiltersModal from './DishesFiltersModal';
import ViewModeToggle from './ViewModeToggle';
import LocationInfo from './LocationInfo';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  distance?: number;
  cuisine_types: string[];
  establishment_type?: string;
  services?: string[];
  favorites_count?: number;
  cover_image_url?: string;
  logo_url?: string;
}

interface Dish {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  restaurant_name: string;
  restaurant_slug: string;
  cuisine_types: string[];
  food_types: string[];
  diet_types: string[];
  preparation_time?: number;
  favorites_count?: number;
}

interface CuisineType {
  id: number;
  name: string;
}

interface EstablishmentType {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
}

interface PriceRange {
  id: number;
  name: string;
  value: string;
}

interface RatingOption {
  id: number;
  name: string;
  value: number;
}

interface DistanceRange {
  id: number;
  name: string;
  value: number;
}

interface FoodType {
  id: number;
  name: string;
}

interface DietType {
  id: number;
  name: string;
}

interface TimeRange {
  id: number;
  name: string;
  value: number;
}

interface FoodieSpotLayoutProps {
  initialTab: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showDishesFilters, setShowDishesFilters] = useState(false);
  const isMobile = useIsMobile();

  // Restaurants Hooks
  const {
    restaurantsData,
    loading: restaurantsLoading,
    error: restaurantsError,
  } = useRestaurants(searchTerm);

  // Dishes Hooks
  const {
    dishesData,
    loading: dishesLoading,
    error: dishesError,
  } = useDishes(searchTerm);

  // Filters Hooks
  const { cuisineTypes } = useCuisineTypes();
  const { establishmentTypes } = useEstablishmentTypes();
  const { services } = useServices();
  const { priceRanges } = usePriceRanges();
  const { ratingOptions } = useRatingOptions();
  const { distanceRanges } = useDistanceRanges();
   const { foodTypes } = useFoodTypes();
  const { dietTypes } = useDietTypes();
  const { timeRanges } = useTimeRanges();

  // User Preferences Hooks
  const {
    selectedCuisineTypes,
    selectedEstablishmentTypes,
    selectedServices,
    selectedPriceRange,
    selectedRating,
    selectedDistance,
    selectedFoodTypes,
    selectedDietTypes,
    selectedTimeRange,
    setSelectedCuisineTypes,
    setSelectedEstablishmentTypes,
    setSelectedServices,
    setSelectedPriceRange,
    setSelectedRating,
    setSelectedDistance,
     setSelectedFoodTypes,
    setSelectedDietTypes,
    setSelectedTimeRange,
  } = useUserPreferences();

  const { openAuthModal } = useAuthModal();

  const filteredRestaurants = useMemo(() => {
    if (!restaurantsData?.restaurants) return [];

    return restaurantsData.restaurants.filter((restaurant) => {
      const cuisineFilter = selectedCuisineTypes.length === 0 || selectedCuisineTypes.every(cuisineType =>
        restaurant.cuisine_types.includes(cuisineType)
      );
      const establishmentFilter = selectedEstablishmentTypes.length === 0 || selectedEstablishmentTypes.includes(restaurant.establishment_type || '');
      const servicesFilter = selectedServices.length === 0 || selectedServices.every(service =>
        restaurant.services?.includes(service)
      );
      const priceRangeFilter = !selectedPriceRange || restaurant.price_range === selectedPriceRange;
      const ratingFilter = !selectedRating || (restaurant.google_rating && restaurant.google_rating >= selectedRating);
      const distanceFilter = !selectedDistance || (restaurant.distance && restaurant.distance <= selectedDistance);

      return cuisineFilter && establishmentFilter && servicesFilter && priceRangeFilter && ratingFilter && distanceFilter;
    });
  }, [restaurantsData, selectedCuisineTypes, selectedEstablishmentTypes, selectedServices, selectedPriceRange, selectedRating, selectedDistance]);

  const filteredDishes = useMemo(() => {
    if (!dishesData?.dishes) return [];

    return dishesData.dishes.filter((dish) => {
      const cuisineFilter = selectedCuisineTypes.length === 0 || selectedCuisineTypes.every(cuisineType =>
        dish.cuisine_types.includes(cuisineType)
      );
       const foodTypeFilter = selectedFoodTypes.length === 0 || selectedFoodTypes.every(foodType =>
        dish.food_types.includes(foodType)
      );
      const dietTypeFilter = selectedDietTypes.length === 0 || selectedDietTypes.every(dietType =>
        dish.diet_types.includes(dietType)
      );
      const priceRangeFilter = !selectedPriceRange || priceRanges.find(pr => pr.value === selectedPriceRange)?.name === dish.price.toString();
       const timeRangeFilter = !selectedTimeRange || (dish.preparation_time && dish.preparation_time <= selectedTimeRange);

      return cuisineFilter && foodTypeFilter && dietTypeFilter && priceRangeFilter && timeRangeFilter;
    });
  }, [dishesData, selectedCuisineTypes, selectedFoodTypes, selectedDietTypes, selectedPriceRange, selectedTimeRange, priceRanges]);

  return (
    <>
      <Helmet>
        <title>{activeTab === 'restaurants' ? 'Restaurantes' : 'Platos'} - SavorySpot</title>
        <meta 
          name="description" 
          content={activeTab === 'restaurants' 
            ? 'Descubre los mejores restaurantes cerca de ti' 
            : 'Explora una gran variedad de platos deliciosos'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-background border-b sticky top-0 z-50">
          <div className={`${isMobile ? 'px-2' : 'max-w-6xl mx-auto px-4'} py-4`}>
            <div className="flex flex-col gap-4">
              <LocationInfo />
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeTab={activeTab}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${isMobile ? 'px-2' : 'max-w-6xl mx-auto px-4'} py-6`}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'restaurants' | 'dishes')}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="restaurants" className="text-sm">
                  Restaurantes ({restaurantsData?.restaurants?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="dishes" className="text-sm">
                  Platos ({dishesData?.dishes?.length || 0})
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {!isMobile && (
                  <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => activeTab === 'restaurants' ? setShowFilters(true) : setShowDishesFilters(true)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Sidebar Filters - Desktop */}
              {!isMobile && (
                <div className="w-64 flex-shrink-0">
                  <TabsContent value="restaurants" className="mt-0">
                    <FiltersSidebar
                      cuisineTypes={cuisineTypes}
                      establishmentTypes={establishmentTypes}
                      services={services}
                      priceRanges={priceRanges}
                      ratingOptions={ratingOptions}
                      distanceRanges={distanceRanges}
                      selectedCuisineTypes={selectedCuisineTypes}
                      selectedEstablishmentTypes={selectedEstablishmentTypes}
                      selectedServices={selectedServices}
                      selectedPriceRange={selectedPriceRange}
                      selectedRating={selectedRating}
                      selectedDistance={selectedDistance}
                      onCuisineTypesChange={setSelectedCuisineTypes}
                      onEstablishmentTypesChange={setSelectedEstablishmentTypes}
                      onServicesChange={setSelectedServices}
                      onPriceRangeChange={setSelectedPriceRange}
                      onRatingChange={setSelectedRating}
                      onDistanceChange={setSelectedDistance}
                    />
                  </TabsContent>
                  <TabsContent value="dishes" className="mt-0">
                    <DishesFiltersSidebar
                      cuisineTypes={cuisineTypes}
                      foodTypes={foodTypes}
                      dietTypes={dietTypes}
                      priceRanges={priceRanges}
                      timeRanges={timeRanges}
                      selectedCuisineTypes={selectedCuisineTypes}
                      selectedFoodTypes={selectedFoodTypes}
                      selectedDietTypes={selectedDietTypes}
                      selectedPriceRange={selectedPriceRange}
                      selectedTimeRange={selectedTimeRange}
                      onCuisineTypesChange={setSelectedCuisineTypes}
                      onFoodTypesChange={setSelectedFoodTypes}
                      onDietTypesChange={setSelectedDietTypes}
                      onPriceRangeChange={setSelectedPriceRange}
                      onTimeRangeChange={setSelectedTimeRange}
                    />
                  </TabsContent>
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <TabsContent value="restaurants" className="mt-0">
                  {restaurantsLoading ? (
                    <div className="text-center py-8">Cargando restaurantes...</div>
                  ) : filteredRestaurants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No se encontraron restaurantes con los filtros aplicados
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}>
                      {filteredRestaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant.id}
                          id={restaurant.id}
                          name={restaurant.name}
                          slug={restaurant.slug}
                          description={restaurant.description}
                          priceRange={restaurant.price_range}
                          googleRating={restaurant.google_rating}
                          googleRatingCount={restaurant.google_rating_count}
                          distance={restaurant.distance}
                          cuisineTypes={restaurant.cuisine_types}
                          establishmentType={restaurant.establishment_type}
                          services={restaurant.services}
                          favoritesCount={restaurant.favorites_count}
                          coverImageUrl={restaurant.cover_image_url}
                          logoUrl={restaurant.logo_url}
                          onLoginRequired={openAuthModal}
                          layout={viewMode}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="dishes" className="mt-0">
                  {dishesLoading ? (
                    <div className="text-center py-8">Cargando platos...</div>
                  ) : filteredDishes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No se encontraron platos con los filtros aplicados
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredDishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          id={dish.id}
                          name={dish.name}
                          description={dish.description}
                          price={dish.price}
                          imageUrl={dish.image_url}
                          restaurantName={dish.restaurant_name}
                          restaurantSlug={dish.restaurant_slug}
                          cuisineTypes={dish.cuisine_types}
                          foodTypes={dish.food_types}
                          dietTypes={dish.diet_types}
                          preparationTime={dish.preparation_time}
                          favoritesCount={dish.favorites_count}
                          onLoginRequired={openAuthModal}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Mobile Filters Modals */}
        {isMobile && (
          <>
            <FiltersModal
              open={showFilters}
              onOpenChange={setShowFilters}
              cuisineTypes={cuisineTypes}
              establishmentTypes={establishmentTypes}
              services={services}
              priceRanges={priceRanges}
              ratingOptions={ratingOptions}
              distanceRanges={distanceRanges}
              selectedCuisineTypes={selectedCuisineTypes}
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              selectedServices={selectedServices}
              selectedPriceRange={selectedPriceRange}
              selectedRating={selectedRating}
              selectedDistance={selectedDistance}
              onCuisineTypesChange={setSelectedCuisineTypes}
              onEstablishmentTypesChange={setSelectedEstablishmentTypes}
              onServicesChange={setSelectedServices}
              onPriceRangeChange={setSelectedPriceRange}
              onRatingChange={setSelectedRating}
              onDistanceChange={setSelectedDistance}
            />

            <DishesFiltersModal
              open={showDishesFilters}
              onOpenChange={setShowDishesFilters}
              cuisineTypes={cuisineTypes}
              foodTypes={foodTypes}
              dietTypes={dietTypes}
              priceRanges={priceRanges}
              timeRanges={timeRanges}
              selectedCuisineTypes={selectedCuisineTypes}
              selectedFoodTypes={selectedFoodTypes}
              selectedDietTypes={selectedDietTypes}
              selectedPriceRange={selectedPriceRange}
              selectedTimeRange={selectedTimeRange}
              onCuisineTypesChange={setSelectedCuisineTypes}
              onFoodTypesChange={setSelectedFoodTypes}
              onDietTypesChange={setSelectedDietTypes}
              onPriceRangeChange={setSelectedPriceRange}
              onTimeRangeChange={setSelectedTimeRange}
            />
          </>
        )}
      </div>
    </>
  );
}
