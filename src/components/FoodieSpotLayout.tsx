import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { usePosition } from 'use-position';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import DishCard from '@/components/DishCard';
import FilterTags, { ResetFiltersButton } from '@/components/FilterTags';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useEnhancedRestaurants } from '@/hooks/useEnhancedRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from '@/hooks/use-mobile';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Local search query state
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [debouncedSearchQuery] = useDebounce(localSearchQuery, 300);

  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [isHighRated, setIsHighRated] = useState<boolean>(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState<boolean>(false);
  const [isVegetarianVegan, setIsVegetarianVegan] = useState<boolean>(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);

  // Location state
  const { latitude, longitude, error } = usePosition(true, {
    enableHighAccuracy: true,
  });
  const location = latitude && longitude ? { lat: latitude, lng: longitude } : undefined;

  // Max distance state
  const [maxDistance, setMaxDistance] = useState<number>(50);

  // Dish card state for expanded functionality
  const [expandedDishId, setExpandedDishId] = useState<number | null>(null);

  // Update search params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery);
    } else {
      params.delete('q');
    }

    // Update URL without reloading the page
    navigate(`/?${params.toString()}`, { replace: true });
  }, [debouncedSearchQuery, navigate, searchParams]);

  // Handlers to update filter states
  const handleCuisineSelect = (id: number) => {
    setSelectedCuisines(prev => {
      if (prev.includes(id)) {
        return prev.filter(cuisineId => cuisineId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleFoodTypeSelect = (id: number) => {
    setSelectedFoodTypes(prev => {
      if (prev.includes(id)) {
        return prev.filter(foodTypeId => foodTypeId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePriceRangeChange = (ranges: string[]) => {
    setSelectedPriceRanges(ranges);
  };

  const handleEstablishmentTypeChange = (types: number[]) => {
    setSelectedEstablishmentTypes(types);
  };

  const handleDietTypeChange = (types: number[]) => {
    setSelectedDietTypes(types);
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

  const handleVegetarianVeganChange = (isVegetarianVegan: boolean) => {
    setIsVegetarianVegan(isVegetarianVegan);
  };

  const handleClearFilter = (type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'openNow' | 'highRated' | 'budgetFriendly' | 'vegetarianVegan' | 'all', id?: number) => {
    switch (type) {
      case 'cuisine':
        setSelectedCuisines(prev => prev.filter(cuisineId => cuisineId !== id));
        break;
      case 'foodType':
        setSelectedFoodTypes(prev => prev.filter(foodTypeId => foodTypeId !== id));
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
      case 'openNow':
        setIsOpenNow(false);
        break;
      case 'highRated':
        setIsHighRated(false);
        break;
      case 'budgetFriendly':
        setIsBudgetFriendly(false);
        break;
      case 'vegetarianVegan':
        setIsVegetarianVegan(false);
        break;
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedPriceRanges([]);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setIsOpenNow(false);
        setIsHighRated(false);
        setIsBudgetFriendly(false);
        setIsVegetarianVegan(false);
        break;
      default:
        break;
    }
  };

  const handleClearAllFilters = useCallback(() => {
    handleClearFilter('all');
  }, []);

  const hasActiveFilters = selectedCuisines.length > 0 ||
    selectedFoodTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedEstablishmentTypes.length > 0 ||
    selectedDietTypes.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly ||
    isVegetarianVegan;

  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useEnhancedRestaurants({
    searchQuery: debouncedSearchQuery,
    userLat: location?.lat,
    userLng: location?.lng,
    maxDistance,
    cuisineTypeIds: selectedCuisines,
    priceRanges: selectedPriceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery: debouncedSearchQuery,
    userLat: location?.lat,
    userLng: location?.lng,
    selectedDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    spiceLevels: [],
    prepTimeRanges: []
  });

  return (
    <div className="container relative">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Buscar restaurantes o platos..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="w-full h-12 rounded-full pl-12 pr-16 shadow-md"
        />
        <Search className="absolute left-4 top-3 h-6 w-6 text-gray-500" />
        {localSearchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 rounded-full h-8 w-8 hover:bg-gray-100"
            onClick={() => setLocalSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Location Info */}
      {location ? (
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="mr-2 h-4 w-4" />
          Cerca de ti
        </div>
      ) : (
        <div className="flex items-center text-sm text-gray-500 mb-3">
          {error ? 'Error al obtener la ubicación.' : 'Cargando ubicación...'}
        </div>
      )}

      {/* Filter Tags */}
      <FilterTags
        activeTab={activeTab}
        selectedCuisines={selectedCuisines}
        selectedFoodTypes={selectedFoodTypes}
        selectedPriceRanges={selectedPriceRanges}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        selectedDietTypes={selectedDietTypes}
        isOpenNow={isOpenNow}
        isHighRated={isHighRated}
        isBudgetFriendly={isBudgetFriendly}
        isVegetarianVegan={isVegetarianVegan}
        onClearFilter={handleClearFilter}
        onPriceRangeChange={handlePriceRangeChange}
        onEstablishmentTypeChange={handleEstablishmentTypeChange}
        onDietTypeChange={handleDietTypeChange}
        onOpenNowChange={handleOpenNowChange}
        onHighRatedChange={handleHighRatedChange}
        onBudgetFriendlyChange={handleBudgetFriendlyChange}
        onVegetarianVeganChange={handleVegetarianVeganChange}
      />

      {/* Reset Filters Button */}
      <div className="absolute top-2 right-0">
        <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={handleClearAllFilters} />
      </div>

      {/* Separator */}
      <Separator className="my-4" />

      {/* Tabs */}
      <div className="mb-4">
        <div className="inline-flex rounded-full bg-muted p-1 text-muted-foreground">
          <Button
            variant={activeTab === 'restaurants' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 rounded-full px-3 ${activeTab === 'restaurants' ? 'bg-background text-foreground shadow-sm' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurantes
          </Button>
          <Button
            variant={activeTab === 'dishes' ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 rounded-full px-3 ${activeTab === 'dishes' ? 'bg-background text-foreground shadow-sm' : ''}`}
            onClick={() => setActiveTab('dishes')}
          >
            Platos
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'restaurants' ? (
        restaurantsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-52 rounded-md" />
            ))}
          </div>
        ) : restaurantsError ? (
          <div className="text-red-500">{restaurantsError}</div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        ) : (
          <div className="text-gray-500">No se encontraron restaurantes.</div>
        )
      ) : (
        dishesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-52 rounded-md" />
            ))}
          </div>
        ) : dishesError ? (
          <div className="text-red-500">{dishesError}</div>
        ) : dishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <DishCard 
                key={dish.id} 
                dish={dish}
                restaurantId={dish.restaurant_id || 0}
                expandedDishId={expandedDishId}
                onExpandedChange={setExpandedDishId}
              />
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No se encontraron platos.</div>
        )
      )}
    </div>
  );
}
