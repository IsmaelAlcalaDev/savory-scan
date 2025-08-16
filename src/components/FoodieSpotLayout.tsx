
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDishes } from '@/hooks/useDishes';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import RestaurantCard from './RestaurantCard';
import DishCard from './DishCard';
import SearchBar from './SearchBar';
import FilterTags from './FilterTags';
import UnifiedFiltersModal from './UnifiedFiltersModal';
import BottomNavigation from './BottomNavigation';
import LocationModal from './LocationModal';
import SpiceFilter from './SpiceFilter';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get initial values from URL params
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isHighRated, setIsHighRated] = useState(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Mock user location (you can replace this with actual geolocation)
  const userLat = 40.4168;
  const userLng = -3.7038;

  // Use dishes hook with spice levels
  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery,
    userLat,
    userLng,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedCustomTags,
    spiceLevels: selectedSpiceLevels
  });

  // Use restaurants hook
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery,
    userLat,
    userLng,
    selectedCuisines,
    selectedFoodTypes,
    selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedAllergens,
    isOpenNow,
    isHighRated,
    isBudgetFriendly
  });

  const loading = activeTab === 'dishes' ? dishesLoading : restaurantsLoading;
  const error = activeTab === 'dishes' ? dishesError : restaurantsError;

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);

  const handleTabChange = (value: string) => {
    const newTab = value as 'restaurants' | 'dishes';
    setActiveTab(newTab);
    
    // Update the URL based on the tab
    if (newTab === 'dishes') {
      navigate('/platos', { replace: true });
    } else {
      navigate('/restaurantes', { replace: true });
    }
  };

  const handleClearFilter = (type: string, id?: number) => {
    switch (type) {
      case 'cuisine':
        if (id !== undefined) {
          setSelectedCuisines(prev => prev.filter(c => c !== id));
        }
        break;
      case 'foodType':
        if (id !== undefined) {
          setSelectedFoodTypes(prev => prev.filter(f => f !== id));
        }
        break;
      case 'price':
        setSelectedPriceRanges([]);
        break;
      case 'establishment':
        setSelectedEstablishmentTypes([]);
        break;
      case 'diet':
        setSelectedDietTypes([]);
        break;
      case 'dishDiet':
        setSelectedDishDietTypes([]);
        break;
      case 'customTags':
        setSelectedCustomTags([]);
        break;
      case 'spice':
        setSelectedSpiceLevels([]);
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
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedPriceRanges([]);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setSelectedDishDietTypes([]);
        setSelectedAllergens([]);
        setSelectedCustomTags([]);
        setSelectedSpiceLevels([]);
        setIsOpenNow(false);
        setIsHighRated(false);
        setIsBudgetFriendly(false);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          {/* Location and Search */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Madrid, España</span>
            </Button>
          </div>

          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={activeTab === 'dishes' ? 'Buscar platos...' : 'Buscar restaurantes...'}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes">Platos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[180px] z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
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
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} className="space-y-6">
          <TabsContent value="restaurants" className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Cargando restaurantes...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-destructive">Error: {error}</div>
              </div>
            )}

            {!loading && !error && restaurants && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    image_url={restaurant.image_url}
                    cuisine_name={restaurant.cuisine_name}
                    price_range={restaurant.price_range}
                    google_rating={restaurant.google_rating}
                    distance_km={restaurant.distance_km}
                  />
                ))}
              </div>
            )}

            {!loading && !error && restaurants && restaurants.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No se encontraron restaurantes</div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Cargando platos...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-destructive">Error: {error}</div>
              </div>
            )}

            {!loading && !error && dishes && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={{
                      id: dish.id,
                      name: dish.name,
                      description: dish.description,
                      base_price: dish.base_price,
                      image_url: dish.image_url,
                      is_vegetarian: dish.is_vegetarian,
                      is_vegan: dish.is_vegan,
                      is_gluten_free: dish.is_gluten_free,
                      spice_level: dish.spice_level,
                      restaurant_name: dish.restaurant_name,
                      restaurant_slug: dish.restaurant_slug
                    }}
                  />
                ))}
              </div>
            )}

            {!loading && !error && dishes && dishes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No se encontraron platos</div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
        />
      )}

      {/* Location Modal */}
      <LocationModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}
