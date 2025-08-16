import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useEnhancedRestaurants } from '@/hooks/useEnhancedRestaurants';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useDishes } from '@/hooks/useDishes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import RestaurantGrid from '@/components/RestaurantGrid';
import DishesGrid from '@/components/DishesGrid';
import FilterTags, { ResetFiltersButton } from '@/components/FilterTags';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [dishSearchQuery, setDishSearchQuery] = useState('');
  const debouncedRestaurantSearch = useDebounce(restaurantSearchQuery, 300);
  const debouncedDishSearch = useDebounce(dishSearchQuery, 300);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
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
  const userLocation = useUserLocation();
  const { cuisineTypes, loading: cuisineTypesLoading, error: cuisineTypesError } = useCuisineTypes();
  const { foodTypes, loading: foodTypesLoading, error: foodTypesError } = useFoodTypes();
  const { dietTypes, loading: dietTypesLoading, error: dietTypesError } = useDietTypes();

  // Restaurants hook
  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError 
  } = useEnhancedRestaurants({
    searchQuery: debouncedRestaurantSearch,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisineTypes,
    priceRanges: selectedPriceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow
  });

  // Dishes hook with high rating filter
  const { 
    dishes, 
    loading: dishesLoading, 
    error: dishesError 
  } = useDishes({
    searchQuery: dishSearchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedDietTypes,
    selectedDishDietTypes,
    selectedPriceRanges: activeTab === 'dishes' ? selectedPriceRanges : [],
    selectedFoodTypes,
    selectedCustomTags,
    spiceLevels: selectedSpiceLevels,
    isHighRated: activeTab === 'dishes' ? isHighRated : false
  });

  const handleTabChange = useCallback((value: 'restaurants' | 'dishes') => {
    setActiveTab(value);
    if (value === 'restaurants') {
      navigate('/restaurantes');
    } else {
      navigate('/platos');
    }
  }, [navigate]);

  const handleRestaurantSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestaurantSearchQuery(e.target.value);
  };

  const handleDishSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDishSearchQuery(e.target.value);
  };

  const clearAllFilters = useCallback(() => {
    setSelectedCuisineTypes([]);
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
  }, []);

  const handleClearFilter = useCallback((type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'dishDiet' | 'customTags' | 'spice' | 'openNow' | 'highRated' | 'budgetFriendly' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisineTypes(prev => prev.filter(cuisineId => cuisineId !== id));
        break;
      case 'foodType':
        setSelectedFoodTypes(prev => prev.filter(foodTypeId => foodTypeId !== id));
        break;
      case 'price':
        setSelectedPriceRanges(prev => prev.filter(price => price !== id?.toString()));
        break;
      case 'establishment':
        setSelectedEstablishmentTypes(prev => prev.filter(establishmentTypeId => establishmentTypeId !== id));
        break;
      case 'diet':
        setSelectedDietTypes(prev => prev.filter(dietTypeId => dietTypeId !== id));
        break;
      case 'dishDiet':
        setSelectedDishDietTypes(prev => prev.filter(dietType => dietType !== id?.toString()));
        break;
      case 'customTags':
        setSelectedCustomTags(prev => prev.filter(tag => tag !== id?.toString()));
        break;
      case 'spice':
        setSelectedSpiceLevels(prev => prev.filter(level => level !== id));
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
        clearAllFilters();
        break;
      default:
        break;
    }
  }, [clearAllFilters]);

  const handlePriceRangeChange = (ranges: string[]) => {
    setSelectedPriceRanges(ranges);
  };

  const handleEstablishmentTypeChange = (types: number[]) => {
    setSelectedEstablishmentTypes(types);
  };

  const handleDietTypeChange = (types: number[]) => {
    setSelectedDietTypes(types);
  };

  const handleDishDietTypeChange = (types: string[]) => {
    setSelectedDishDietTypes(types);
  };

  const handleCustomTagsChange = (tags: string[]) => {
    setSelectedCustomTags(tags);
  };

  const handleSpiceLevelChange = (levels: number[]) => {
    setSelectedSpiceLevels(levels);
  };

  const handleOpenNowChange = (isOpen: boolean) => {
    setIsOpenNow(isOpen);
  };

  const handleHighRatedChange = (isHighRated: boolean) => {
    setIsHighRated(isHighRated);
  };

  const handleBudgetFriendlyChange = (isBudgetFriendly: boolean) => {
    setIsBudgetFriendly(isBudgetFriendly);
  };

  const hasActiveFilters = selectedCuisineTypes.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedPriceRanges.length > 0 || 
    selectedEstablishmentTypes.length > 0 || 
    (activeTab === 'restaurants' ? selectedDietTypes.length > 0 : selectedDishDietTypes.length > 0) ||
    selectedCustomTags.length > 0 ||
    selectedSpiceLevels.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly;

  return (
    <div className="container relative">
      <div className="flex items-center justify-between py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger value="restaurants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Restaurantes</TabsTrigger>
            <TabsTrigger value="dishes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Platos</TabsTrigger>
          </TabsList>
        </Tabs>
        <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={clearAllFilters} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full">
          <div className="relative">
            <Input 
              type="search" 
              placeholder={`Buscar ${activeTab === 'restaurants' ? 'restaurantes' : 'platos'}...`} 
              value={activeTab === 'restaurants' ? restaurantSearchQuery : dishSearchQuery}
              onChange={activeTab === 'restaurants' ? handleRestaurantSearchChange : handleDishSearchChange}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="mt-4">
            <FilterTags 
              activeTab={activeTab}
              selectedCuisines={selectedCuisineTypes}
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
              onPriceRangeChange={handlePriceRangeChange}
              onEstablishmentTypeChange={handleEstablishmentTypeChange}
              onDietTypeChange={handleDietTypeChange}
              onDishDietTypeChange={handleDishDietTypeChange}
              onCustomTagsChange={handleCustomTagsChange}
              onSpiceLevelChange={handleSpiceLevelChange}
              onOpenNowChange={handleOpenNowChange}
              onHighRatedChange={handleHighRatedChange}
              onBudgetFriendlyChange={handleBudgetFriendlyChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TabsContent value="restaurants" className="p-0 outline-none">
          {restaurantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : restaurantsError ? (
            <p className="text-red-500">{restaurantsError}</p>
          ) : (
            <RestaurantGrid restaurants={restaurants} />
          )}
        </TabsContent>
        <TabsContent value="dishes" className="p-0 outline-none">
          <DishesGrid dishes={dishes} loading={dishesLoading} error={dishesError} />
        </TabsContent>
      </div>
    </div>
  );
}
