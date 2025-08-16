
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import RestaurantCard from '@/components/RestaurantCard';
import DishCard from '@/components/DishCard';
import FilterTags from '@/components/FilterTags';
import BottomNavigation from '@/components/BottomNavigation';
import EstablishmentTypeModal from '@/components/EstablishmentTypeModal';
import UnifiedFiltersModal from './UnifiedFiltersModal';
import { ResetFiltersButton } from './FilterTags';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [isHighRated, setIsHighRated] = useState<boolean>(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState<boolean>(false);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  // Get user location
  const { userLocation, isLoading: locationLoading, error: locationError } = useUserLocation();

  // Dishes hook with correct parameters including selectedSpiceLevels
  const { 
    dishes, 
    loading: dishesLoading, 
    error: dishesError 
  } = useDishes({
    searchQuery: searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedCustomTags,
    selectedSpiceLevels
  });

  // Restaurants hook with correct parameters
  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError 
  } = useRestaurants({
    searchQuery: searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisines,
    selectedFoodTypes,
    priceRanges: selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isHighRated,
    isBudgetFriendly,
    selectedAllergens
  });

  useEffect(() => {
    const path = activeTab === 'restaurants' ? '/restaurantes' : '/platos';
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  }, [activeTab, navigate, location.pathname]);

  const handleTabChange = (tab: 'restaurants' | 'dishes') => {
    setActiveTab(tab);
  };

  const handleClearFilter = (type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'dishDiet' | 'customTags' | 'spice' | 'openNow' | 'highRated' | 'budgetFriendly' | 'allergen' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisines(selectedCuisines.filter(cuisineId => cuisineId !== id));
        break;
      case 'foodType':
        setSelectedFoodTypes(selectedFoodTypes.filter(foodTypeId => foodTypeId !== id));
        break;
      case 'price':
        setSelectedPriceRanges(selectedPriceRanges.filter(priceRange => priceRange !== id?.toString()));
        break;
      case 'establishment':
        setSelectedEstablishmentTypes(selectedEstablishmentTypes.filter(establishmentTypeId => establishmentTypeId !== id));
        break;
      case 'diet':
        setSelectedDietTypes(selectedDietTypes.filter(dietTypeId => dietTypeId !== id));
        break;
      case 'dishDiet':
        setSelectedDishDietTypes(selectedDishDietTypes.filter(dietType => dietType !== id?.toString()));
        break;
      case 'customTags':
        setSelectedCustomTags(selectedCustomTags.filter(tag => tag !== id?.toString()));
        break;
      case 'spice':
        setSelectedSpiceLevels(selectedSpiceLevels.filter(level => level !== id));
        break;
      case 'openNow':
        setIsOpenNow(false);
        break;
      case 'highRated':
        setIsHighRated(false);
        break;
      case 'budgetFriendly':
        setIsBudgetFriendly(false);
        break;
      case 'allergen':
        setSelectedAllergens(selectedAllergens.filter(allergen => allergen !== id?.toString()));
        break;
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedPriceRanges([]);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setSelectedDishDietTypes([]);
        setSelectedCustomTags([]);
        setSelectedSpiceLevels([]);
        setIsOpenNow(false);
        setIsHighRated(false);
        setIsBudgetFriendly(false);
        setSelectedAllergens([]);
        break;
      default:
        break;
    }
  };

  const hasActiveFilters = selectedCuisines.length > 0 ||
    selectedFoodTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedEstablishmentTypes.length > 0 ||
    (activeTab === 'restaurants' ? selectedDietTypes.length > 0 : selectedDishDietTypes.length > 0) ||
    selectedCustomTags.length > 0 ||
    selectedSpiceLevels.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly ||
    selectedAllergens.length > 0;

  const handleClearAllFilters = () => {
    handleClearFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 py-6">
        <div className="container max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">FoodieSpot</h1>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Buscar restaurantes o platos..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>
      
      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Tabs defaultValue={activeTab} className="mb-4" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes">Platos</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurants">
              {restaurantsLoading ? (
                <p>Cargando restaurantes...</p>
              ) : restaurantsError ? (
                <p>Error: {restaurantsError}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Restaurantes Cercanos</h2>
                    <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={handleClearAllFilters} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {restaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="dishes">
              {dishesLoading ? (
                <p>Cargando platos...</p>
              ) : dishesError ? (
                <p>Error: {dishesError}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Platos Populares</h2>
                    <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={handleClearAllFilters} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dishes.map((dish) => (
                      <DishCard 
                        key={dish.id} 
                        dish={{
                          ...dish,
                          is_lactose_free: false,
                          variants: []
                        }} 
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>

          {/* Filter Tags */}
          <div className="mb-6">
            <FilterTags
              activeTab={activeTab}
              selectedCuisines={selectedCuisines}
              selectedFoodTypes={selectedFoodTypes}
              selectedPriceRanges={selectedPriceRanges}
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              selectedDietTypes={selectedDietTypes}
              selectedDishDietTypes={selectedDishDietTypes}
              selectedCustomTags={selectedCustomTags}
              selectedSpiceLevels={selectedSpiceLevels}
              isOpenNow={isOpenNow}
              isHighRated={isHighRated}
              isBudgetFriendly={isBudgetFriendly}
              onClearFilter={handleClearFilter}
              onPriceRangeChange={setSelectedPriceRanges}
              onEstablishmentTypeChange={setSelectedEstablishmentTypes}
              onDietTypeChange={setSelectedDietTypes}
              onDishDietTypeChange={setSelectedDishDietTypes}
              onCustomTagsChange={setSelectedCustomTags}
              onSpiceLevelChange={setSelectedSpiceLevels}
              onOpenNowChange={setIsOpenNow}
              onHighRatedChange={setIsHighRated}
              onBudgetFriendlyChange={setIsBudgetFriendly}
            />
          </div>
        </div>
      </main>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />

      <EstablishmentTypeModal
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        onEstablishmentTypeChange={setSelectedEstablishmentTypes}
      />

      <UnifiedFiltersModal
        activeTab={activeTab}
        selectedAllergens={selectedAllergens}
        selectedDietTypes={selectedDietTypes}
        selectedDishDietTypes={selectedDishDietTypes}
        selectedSpiceLevels={selectedSpiceLevels}
        onAllergenChange={setSelectedAllergens}
        onDietTypeChange={setSelectedDietTypes}
        onDishDietTypeChange={setSelectedDishDietTypes}
        onSpiceLevelChange={setSelectedSpiceLevels}
      />
    </div>
  );
}
