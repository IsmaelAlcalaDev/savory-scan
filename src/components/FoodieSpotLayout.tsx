import React, { useState, useEffect, useCallback, Dispatch } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ChevronDown } from 'lucide-react';
import RestaurantCard from '@/components/RestaurantCard';
import DishCard from '@/components/DishCard';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import FilterTags, { ResetFiltersButton } from '@/components/FilterTags';

export default function FoodieSpotLayout() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isHighRated, setIsHighRated] = useState<boolean>(false);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState<boolean>(false);
  const [isMostPopular, setIsMostPopular] = useState<boolean>(false);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(false);
  const [sortByPopularity, setSortByPopularity] = useState<boolean>(false);

  const {
    userLat,
    userLng,
    locationLoading,
    locationError,
    enableLocation,
    disableLocation
  } = useGeolocation();

  const handleCustomTagsChange = (tags: string[]) => {
    setSelectedCustomTags(tags);
  };

  const handleClearFilter = (
    type: 'cuisine' | 'foodType' | 'price' | 'highRated' | 'establishment' | 'diet' | 'dishDiet' | 'spice' | 'customTags' | 'openNow' | 'budgetFriendly' | 'mostPopular' | 'all',
    id?: number
  ) => {
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
      case 'highRated':
        setIsHighRated(false);
        break;
      case 'establishment':
        if (id !== undefined) {
          setSelectedEstablishmentTypes(prev => prev.filter(e => e !== id));
        } else {
          setSelectedEstablishmentTypes([]);
        }
        break;
      case 'diet':
        if (id !== undefined) {
          setSelectedDietTypes(prev => prev.filter(d => d !== id));
        } else {
          setSelectedDietTypes([]);
        }
        break;
      case 'dishDiet':
        setSelectedDishDietTypes([]);
        break;
      case 'spice':
        setSelectedSpiceLevels([]);
        break;
      case 'customTags':
        setSelectedCustomTags([]);
        break;
      case 'openNow':
        setIsOpenNow(false);
        break;
      case 'budgetFriendly':
        setIsBudgetFriendly(false);
        break;
      case 'mostPopular':
        setIsMostPopular(false);
        break;
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedPriceRanges([]);
        setIsHighRated(false);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setSelectedDishDietTypes([]);
        setSelectedSpiceLevels([]);
        setSelectedCustomTags([]);
        setIsOpenNow(false);
        setIsBudgetFriendly(false);
        setIsMostPopular(false);
        break;
    }
  };

  const hasActiveFilters = selectedCuisines.length > 0 || 
    selectedFoodTypes.length > 0 || 
    selectedPriceRanges.length > 0 || 
    isHighRated || 
    selectedEstablishmentTypes.length > 0 || 
    selectedDietTypes.length > 0 ||
    selectedDishDietTypes.length > 0 ||
    selectedSpiceLevels.length > 0 ||
    selectedCustomTags.length > 0 ||
    isOpenNow ||
    isBudgetFriendly ||
    isMostPopular;

  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery: debouncedSearchQuery,
    userLat: locationEnabled ? userLat : undefined,
    userLng: locationEnabled ? userLng : undefined,
    selectedCuisines,
    selectedFoodTypes,
    selectedPriceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    isOpenNow,
    isBudgetFriendly
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery: debouncedSearchQuery,
    userLat: locationEnabled ? userLat : undefined,
    userLng: locationEnabled ? userLng : undefined,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCustomTags,
    spiceLevels: selectedSpiceLevels,
    sortByPopularity: isMostPopular
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary py-4">
        <div className="container mx-auto px-4 flex items-center justify-between max-w-7xl">
          <h1 className="text-2xl font-bold">FoodieSpot</h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MapPin className="mr-2 h-4 w-4" />
                {locationEnabled && userLat && userLng
                  ? `Ubicación activada`
                  : 'Activar ubicación'
                }
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ubicación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (!locationEnabled) {
                    enableLocation();
                    setLocationEnabled(true);
                  } else {
                    disableLocation();
                    setLocationEnabled(false);
                  }
                }}
              >
                {locationEnabled ? 'Desactivar ubicación' : 'Activar ubicación'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Tabs defaultValue="restaurants" className="mb-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
            <TabsTrigger value="dishes">Platos</TabsTrigger>
          </TabsList>
          <TabsContent value="restaurants">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Buscar restaurantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button><Search className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
          <TabsContent value="dishes">
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                placeholder="Buscar platos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button><Search className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Filters */}
        <div className="mb-6">
          <FilterTags
            activeTab={activeTab}
            selectedCuisines={selectedCuisines}
            selectedFoodTypes={selectedFoodTypes}
            selectedPriceRanges={selectedPriceRanges}
            isHighRated={isHighRated}
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            selectedDietTypes={selectedDietTypes}
            selectedDishDietTypes={selectedDishDietTypes}
            selectedSpiceLevels={selectedSpiceLevels}
            selectedCustomTags={selectedCustomTags}
            isOpenNow={isOpenNow}
            isBudgetFriendly={isBudgetFriendly}
            isMostPopular={isMostPopular}
            onClearFilter={handleClearFilter}
            onPriceRangeChange={setSelectedPriceRanges}
            onHighRatedChange={setIsHighRated}
            onEstablishmentTypeChange={setSelectedEstablishmentTypes}
            onDietTypeChange={setSelectedDietTypes}
            onDishDietTypeChange={setSelectedDishDietTypes}
            onSpiceLevelChange={setSelectedSpiceLevels}
            onCustomTagsChange={handleCustomTagsChange}
            onOpenNowChange={setIsOpenNow}
            onBudgetFriendlyChange={setIsBudgetFriendly}
            onMostPopularChange={setIsMostPopular}
          />

          <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={() => handleClearFilter('all')} />
        </div>

        {/* Content */}
        {activeTab === 'restaurants' && (
          <div>
            {restaurantsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-40 w-full rounded-md" />
                    <div className="space-y-2 mt-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : restaurantsError ? (
              <p className="text-red-500">Error: {restaurantsError}</p>
            ) : restaurants.length === 0 ? (
              <p>No se encontraron restaurantes con los filtros seleccionados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dishes' && (
          <div>
            {dishesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-40 w-full rounded-md" />
                    <div className="space-y-2 mt-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dishesError ? (
              <p className="text-red-500">Error: {dishesError}</p>
            ) : dishes.length === 0 ? (
              <p>No se encontraron platos con los filtros seleccionados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
