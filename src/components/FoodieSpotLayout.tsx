
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import SearchBar from './SearchBar';
import FilterTags from './FilterTags';
import UnifiedRestaurantsTab from './UnifiedRestaurantsTab';
import DishesWithSort from './DishesWithSort';

export default function FoodieSpotLayout() {
  const { userLocation } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">("restaurants");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [spiceLevels, setSpiceLevels] = useState<number[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  const { cuisineTypes } = useCuisineTypes();
  const { establishmentTypes } = useEstablishmentTypes();
  const { dietTypes } = useDietTypes();
  const { foodTypes } = useFoodTypes();

  const [restaurantSortBy, setRestaurantSortBy] = useState<string>('recommended');
  const [dishSortBy, setDishSortBy] = useState<string>('rating');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRestaurantSortChange = (sortBy: string) => {
    setRestaurantSortBy(sortBy);
  };

  const handleDishSortChange = (sortBy: string) => {
    setDishSortBy(sortBy);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "restaurants" | "dishes");
  };

  // Create mapped arrays for FilterTags
  const mappedCuisineTypes = cuisineTypes.map(ct => ({ id: ct.id, name: ct.name }));
  const mappedEstablishmentTypes = establishmentTypes.map(et => ({ id: et.id, name: et.name }));
  const mappedDietTypes = dietTypes.map(dt => ({ id: dt.id, name: dt.name }));
  const mappedFoodTypes = foodTypes.map(ft => ({ id: ft.id, name: ft.name }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <SearchBar onSearch={handleSearch} initialSearchQuery={searchQuery} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <FilterTags
          cuisineTypes={mappedCuisineTypes.filter(ct => selectedCuisineTypes.includes(ct.id))}
          establishmentTypes={mappedEstablishmentTypes.filter(et => selectedEstablishmentTypes.includes(et.id))}
          dietTypes={mappedDietTypes.filter(dt => selectedDietTypes.includes(dt.id))}
          foodTypes={mappedFoodTypes.filter(ft => selectedFoodTypes.includes(ft.id))}
          dishDietTypes={selectedDishDietTypes}
          priceRanges={selectedPriceRanges}
          customTags={selectedCustomTags}
          spiceLevels={spiceLevels}
          currentTab={activeTab}
          restaurants={activeTab === 'restaurants' ? [] : undefined}
          dishes={activeTab === 'dishes' ? [] : undefined}
          onSortChange={activeTab === 'restaurants' ? handleRestaurantSortChange : handleDishSortChange}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full flex justify-center">
            <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
            <TabsTrigger value="dishes">Platos</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="restaurants" className="mt-0">
              <UnifiedRestaurantsTab
                searchQuery={searchQuery}
                cuisineTypeIds={selectedCuisineTypes}
                priceRanges={selectedPriceRanges}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietTypes={selectedDietTypes}
                maxDistance={maxDistance}
                onSortChange={handleRestaurantSortChange}
              />
            </TabsContent>

            <TabsContent value="dishes" className="mt-0">
              <DishesWithSort
                searchQuery={searchQuery}
                userLat={userLocation?.latitude}
                userLng={userLocation?.longitude}
                maxDistance={maxDistance}
                selectedDietTypes={selectedDietTypes}
                selectedDishDietTypes={selectedDishDietTypes}
                selectedPriceRanges={selectedPriceRanges}
                selectedFoodTypes={selectedFoodTypes}
                selectedCustomTags={selectedCustomTags}
                spiceLevels={spiceLevels}
                onSortChange={handleDishSortChange}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
