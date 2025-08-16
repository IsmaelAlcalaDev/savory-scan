import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useRestaurants } from '@/hooks/useEnhancedRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import InlineSearchBar from '@/components/InlineSearchBar';
import FilterTags from '@/components/FilterTags';
import RestaurantGrid from '@/components/RestaurantGrid';
import DishesGrid from '@/components/DishesGrid';
import { MapPin, Navigation, Settings2 } from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone_number: string;
  website_url: string;
  google_maps_url: string;
  price_range: string;
  cuisine_type_id: number;
  food_type_id: number;
  rating: number;
  google_rating: number;
  review_count: number;
  image_url: string;
  is_active: boolean;
  opening_hours: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  cuisine_types?: {
    id: number;
    name: string;
  };
  food_types?: {
    id: number;
    name: string;
  };
  establishment_type_id: number;
  establishment_types?: {
    id: number;
    name: string;
  };
  diet_types?: {
    id: number;
    name: string;
    category: string;
  }[];
}

interface CuisineType {
  id: number;
  name: string;
}

interface FoodType {
  id: number;
  name: string;
}

interface UseRestaurantsParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedCuisines?: number[];
  selectedFoodTypes?: number[];
  selectedPriceRanges?: string[];
  selectedEstablishmentTypes?: number[];
  selectedDietTypes?: number[];
  isOpenNow?: boolean;
  isHighRated?: boolean;
  isBudgetFriendly?: boolean;
}

interface DishData {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  image_alt?: string;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_healthy: boolean;
  spice_level: number;
  preparation_time_minutes?: number;
  favorites_count: number;
  category_name?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_latitude: number;
  restaurant_longitude: number;
  restaurant_price_range: string;
  restaurant_google_rating?: number;
  distance_km?: number;
  formatted_price: string;
  custom_tags: string[];
}

interface UseDishesParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  selectedDietTypes?: number[];
  selectedDishDietTypes?: string[];
  selectedPriceRanges?: string[];
  selectedFoodTypes?: number[];
  selectedCustomTags?: string[];
  spiceLevels?: number[];
}

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { location, getCurrentLocation, isLoading: locationLoading } = useUserLocation();
  
  // State variables
  const [userDeniedLocation, setUserDeniedLocation] = useState(false);
  const [showSettingsFallback, setShowSettingsFallback] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') as 'restaurants' | 'dishes' | null;
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!location && !locationLoading && !userDeniedLocation) {
      getCurrentLocation()
        .catch(() => {
          setUserDeniedLocation(true);
          setShowSettingsFallback(true);
        });
    }
  }, [location, locationLoading, getCurrentLocation, userDeniedLocation]);

  useEffect(() => {
    if (userDeniedLocation) {
      const timer = setTimeout(() => {
        setShowSettingsFallback(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [userDeniedLocation]);

  const handleRetryLocation = () => {
    setUserDeniedLocation(false);
    setShowSettingsFallback(false);
    getCurrentLocation()
      .catch(() => {
        setUserDeniedLocation(true);
        setShowSettingsFallback(true);
      });
  };

  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isHighRated, setIsHighRated] = useState(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);

  // URL Parameter Sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab) params.set('tab', activeTab);
    
    // Append filter parameters
    selectedCuisines.forEach(id => params.append('cuisine', id.toString()));
    selectedFoodTypes.forEach(id => params.append('foodType', id.toString()));
    selectedPriceRanges.forEach(range => params.append('priceRange', range));
    selectedEstablishmentTypes.forEach(type => params.append('establishmentType', type.toString()));
    selectedDietTypes.forEach(type => params.append('dietType', type.toString()));
    selectedDishDietTypes.forEach(type => params.append('dishDietType', type));
    selectedCustomTags.forEach(tag => params.append('customTag', tag));
    selectedSpiceLevels.forEach(level => params.append('spiceLevel', level.toString()));
    if (isOpenNow) params.set('openNow', 'true');
    if (isHighRated) params.set('highRated', 'true');
    if (isBudgetFriendly) params.set('budgetFriendly', 'true');

    setSearchParams(params);
  }, [
    searchQuery, 
    activeTab, 
    selectedCuisines, 
    selectedFoodTypes, 
    selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedDishDietTypes,
    selectedCustomTags,
    selectedSpiceLevels,
    isOpenNow,
    isHighRated,
    isBudgetFriendly,
    setSearchParams
  ]);

  // Load filter states from URL parameters on initial load
  useEffect(() => {
    const urlCuisines = searchParams.getAll('cuisine').map(Number);
    const urlFoodTypes = searchParams.getAll('foodType').map(Number);
    const urlPriceRanges = searchParams.getAll('priceRange');
    const urlEstablishmentTypes = searchParams.getAll('establishmentType').map(Number);
    const urlDietTypes = searchParams.getAll('dietType').map(Number);
    const urlDishDietTypes = searchParams.getAll('dishDietType');
    const urlCustomTags = searchParams.getAll('customTag');
    const urlSpiceLevels = searchParams.getAll('spiceLevel').map(Number);
    const urlOpenNow = searchParams.get('openNow') === 'true';
    const urlHighRated = searchParams.get('highRated') === 'true';
    const urlBudgetFriendly = searchParams.get('budgetFriendly') === 'true';

    setSelectedCuisines(urlCuisines);
    setSelectedFoodTypes(urlFoodTypes);
    setSelectedPriceRanges(urlPriceRanges);
    setSelectedEstablishmentTypes(urlEstablishmentTypes);
    setSelectedDietTypes(urlDietTypes);
    setSelectedDishDietTypes(urlDishDietTypes);
    setSelectedCustomTags(urlCustomTags);
    setSelectedSpiceLevels(urlSpiceLevels);
    setIsOpenNow(urlOpenNow);
    setIsHighRated(urlHighRated);
    setIsBudgetFriendly(urlBudgetFriendly);
  }, [searchParams]);

  // Fetch data
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery: debouncedSearchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    selectedCuisines,
    selectedFoodTypes,
    selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isHighRated,
    isBudgetFriendly
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery: debouncedSearchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedCustomTags,
    selectedSpiceLevels
  });

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    // Update location state
    // Update URL parameters if needed
  }, []);

  const handleSearchChange = (newSearchQuery: string) => {
    setSearchQuery(newSearchQuery);
  };

  const handleClearFilter = useCallback((type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'dishDiet' | 'customTags' | 'spice' | 'openNow' | 'highRated' | 'budgetFriendly' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        if (id !== undefined) {
          setSelectedCuisines(prev => prev.filter(c => c !== id));
        } else {
          setSelectedCuisines([]);
        }
        break;
      case 'foodType':
        if (id !== undefined) {
          setSelectedFoodTypes(prev => prev.filter(f => f !== id));
        } else {
          setSelectedFoodTypes([]);
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
        setSelectedCustomTags([]);
        setSelectedSpiceLevels([]);
        setIsOpenNow(false);
        setIsHighRated(false);
        setIsBudgetFriendly(false);
        break;
    }
  }, []);

  const memoizedRestaurantsContent = useMemo(() => (
    <RestaurantGrid 
      restaurants={restaurants}
      loading={restaurantsLoading}
      error={restaurantsError}
    />
  ), [restaurants, restaurantsLoading, restaurantsError]);

  const memoizedDishesContent = useMemo(() => (
    <DishesGrid 
      dishes={dishes}
      loading={dishesLoading}
      error={dishesError}
    />
  ), [dishes, dishesLoading, dishesError]);

  const handleTabChange = useCallback((value: string) => {
    const newTab = value as 'restaurants' | 'dishes';
    setActiveTab(newTab);
    
    const newParams = new URLSearchParams(searchParams);
    if (newTab === 'dishes') {
      navigate('/platos?' + newParams.toString());
    } else {
      navigate('/restaurantes?' + newParams.toString());
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">FoodieSpot</h1>
            {locationLoading ? (
              <Button variant="secondary" disabled>
                <Settings2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando Ubicación...
              </Button>
            ) : location ? (
              <Button variant="secondary">
                <MapPin className="mr-2 h-4 w-4" />
                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </Button>
            ) : (
              <Button variant="outline" onClick={handleRetryLocation}>
                <Navigation className="mr-2 h-4 w-4" />
                Reintentar Ubicación
              </Button>
            )}
          </div>
          {showSettingsFallback && (
            <Card className="mt-4">
              <CardContent className="py-4 px-6">
                <p className="text-sm text-muted-foreground">
                  No pudimos obtener tu ubicación. Por favor, asegúrate de que los servicios de ubicación estén activados en tu navegador y dispositivo.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col gap-4 mb-6">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="restaurants" className="text-base font-medium">
                Restaurantes
              </TabsTrigger>
              <TabsTrigger value="dishes" className="text-base font-medium">
                Platos
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <InlineSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                placeholder={activeTab === 'restaurants' ? 'Buscar restaurantes...' : 'Buscar platos...'}
              />

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

          <TabsContent value="restaurants" className="space-y-6">
            {memoizedRestaurantsContent}
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            {memoizedDishesContent}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
