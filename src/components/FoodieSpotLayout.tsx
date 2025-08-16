
import { useState, useEffect } from 'react';
import { useGeolocated } from 'react-geolocated';
import { useDebounce } from 'use-debounce';
import { MapPin, Search } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import RestaurantsGrid from './RestaurantsGrid';
import DishesGrid from './DishesGrid';
import FilterTags from './FilterTags';
import { ResetFiltersButton } from './FilterTags';
import { useIsMobile } from '@/hooks/use-mobile';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isHighRated, setIsHighRated] = useState(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const isMobile = useIsMobile();
  
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    watchPosition: false,
  });

  useEffect(() => {
    if (coords) {
      setUserLat(coords.latitude);
      setUserLng(coords.longitude);
      setIsLoadingLocation(false);
    } else {
      setIsLoadingLocation(false);
    }
  }, [coords]);

  const handleTabChange = (tab: "restaurants" | "dishes") => {
    setActiveTab(tab);
  };

  const handleClearFilter = (
    type: 'cuisine' | 'foodType' | 'price' | 'establishment' | 'diet' | 'customTags' | 'allergens' | 'openNow' | 'highRated' | 'budgetFriendly' | 'all',
    id?: number
  ) => {
    switch (type) {
      case 'cuisine':
        if (id !== undefined) {
          setSelectedCuisines(prev => prev.filter(cuisineId => cuisineId !== id));
        }
        break;
      case 'foodType':
        if (id !== undefined) {
          setSelectedFoodTypes(prev => prev.filter(foodTypeId => foodTypeId !== id));
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
      case 'customTags':
        setSelectedCustomTags([]);
        break;
      case 'allergens':
        setSelectedAllergens([]);
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
        setSelectedCustomTags([]);
        setSelectedAllergens([]);
        setIsOpenNow(false);
        setIsHighRated(false);
        setIsBudgetFriendly(false);
        break;
    }
  };

  const hasActiveFilters = selectedCuisines.length > 0 ||
    selectedFoodTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedEstablishmentTypes.length > 0 ||
    selectedDietTypes.length > 0 ||
    selectedCustomTags.length > 0 ||
    selectedAllergens.length > 0 ||
    isOpenNow ||
    isHighRated ||
    isBudgetFriendly;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">FoodieSpot</h1>
          </div>
        </div>
      </header>

      <main className="pb-16 md:pb-0">
        {/* Search and Filters Section */}
        <div className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
          {/* Search Bar */}
          <div className="container mx-auto px-4 py-4 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar restaurantes o platos..."
                className="w-full pl-9 pr-3 py-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Tags */}
          <div className="px-4 pb-3">
            <FilterTags 
              activeTab={activeTab}
              selectedCuisines={selectedCuisines}
              selectedFoodTypes={selectedFoodTypes}
              selectedPriceRanges={selectedPriceRanges}
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              selectedDietTypes={selectedDietTypes}
              selectedCustomTags={selectedCustomTags}
              selectedAllergens={selectedAllergens}
              isOpenNow={isOpenNow}
              isHighRated={isHighRated}
              isBudgetFriendly={isBudgetFriendly}
              onClearFilter={handleClearFilter}
              onPriceRangeChange={setSelectedPriceRanges}
              onEstablishmentTypeChange={setSelectedEstablishmentTypes}
              onDietTypeChange={setSelectedDietTypes}
              onCustomTagsChange={setSelectedCustomTags}
              onAllergenChange={setSelectedAllergens}
              onOpenNowChange={setIsOpenNow}
              onHighRatedChange={setIsHighRated}
              onBudgetFriendlyChange={setIsBudgetFriendly}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 py-6">
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
            <TabsList className="w-full flex justify-center">
              <TabsTrigger value="restaurants" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Platos</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurants" className="space-y-4">
              <RestaurantsGrid 
                searchQuery={debouncedSearchQuery}
                userLat={userLat}
                userLng={userLng}
                selectedCuisines={selectedCuisines}
                selectedFoodTypes={selectedFoodTypes}
                selectedPriceRanges={selectedPriceRanges}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                isOpenNow={isOpenNow}
                isHighRated={isHighRated}
                isBudgetFriendly={isBudgetFriendly}
                isLoadingLocation={isLoadingLocation}
                isGeolocationAvailable={isGeolocationAvailable}
                isGeolocationEnabled={isGeolocationEnabled}
              />
            </TabsContent>
            <TabsContent value="dishes" className="space-y-4">
              <DishesGrid 
                searchQuery={debouncedSearchQuery}
                userLat={userLat}
                userLng={userLng}
                selectedDietTypes={selectedDietTypes}
                selectedPriceRanges={selectedPriceRanges}
                selectedFoodTypes={selectedFoodTypes}
                selectedCustomTags={selectedCustomTags}
                selectedAllergens={selectedAllergens}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Bottom Navigation */}
      {isMobile && (
        <div className="bg-white border-t border-gray-100 fixed bottom-0 left-0 w-full py-2 px-4 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Button variant="ghost" className="gap-1">
              <MapPin className="h-4 w-4" />
              Cerca de mí
            </Button>
            <ResetFiltersButton hasActiveFilters={hasActiveFilters} onClearAll={() => handleClearFilter('all')} />
          </div>
        </div>
      )}
    </div>
  );
}
