import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useFoodTypes } from '@/hooks/useFoodTypes';
import { SearchBar } from './SearchBar';
import FilterTags from './FilterTags';
import CuisineTypesModal from './CuisineTypesModal';
import EstablishmentTypesModal from './EstablishmentTypesModal';
import DietTypesModal from './DietTypesModal';
import PriceRangesModal from './PriceRangesModal';
import FoodTypesModal from './FoodTypesModal';
import CustomTagsModal from './CustomTagsModal';
import SpiceLevelsModal from './SpiceLevelsModal';
import UnifiedRestaurantsTab from './UnifiedRestaurantsTab';
import DishesWithSort from './DishesWithSort';

export default function FoodieSpotLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userLocation, setUserLocation } = useUserPreferences();

  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">("restaurants");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [spiceLevels, setSpiceLevels] = useState<number[]>([]);
  const [isHighRated, setIsHighRated] = useState<boolean>(false);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  const [maxDistance, setMaxDistance] = useState<number>(10);

  const [isCuisineTypesModalOpen, setIsCuisineTypesModalOpen] = useState(false);
  const [isEstablishmentTypesModalOpen, setIsEstablishmentTypesModalOpen] = useState(false);
  const [isDietTypesModalOpen, setIsDietTypesModalOpen] = useState(false);
  const [isPriceRangesModalOpen, setIsPriceRangesModalOpen] = useState(false);
  const [isFoodTypesModalOpen, setIsFoodTypesModalOpen] = useState(false);
  const [isCustomTagsModalOpen, setIsCustomTagsModalOpen] = useState(false);
  const [isSpiceLevelsModalOpen, setIsSpiceLevelsModalOpen] = useState(false);

  const { cuisineTypes } = useCuisineTypes();
  const { establishmentTypes } = useEstablishmentTypes();
  const { dietTypes } = useDietTypes();
  const { foodTypes } = useFoodTypes();

  const [restaurantSortBy, setRestaurantSortBy] = useState<string>('recommended');
  const [dishSortBy, setDishSortBy] = useState<string>('rating');

  useEffect(() => {
    const initialCuisineTypes = searchParams.getAll('cuisineType').map(Number);
    setSelectedCuisineTypes(initialCuisineTypes);

    const initialEstablishmentTypes = searchParams.getAll('establishmentType').map(Number);
    setSelectedEstablishmentTypes(initialEstablishmentTypes);

    const initialDietTypes = searchParams.getAll('dietType').map(Number);
    setSelectedDietTypes(initialDietTypes);

    const initialDishDietTypes = searchParams.getAll('dishDietType');
    setSelectedDishDietTypes(initialDishDietTypes);

    const initialPriceRanges = searchParams.getAll('priceRange');
    setSelectedPriceRanges(initialPriceRanges);

    const initialFoodTypes = searchParams.getAll('foodType').map(Number);
    setSelectedFoodTypes(initialFoodTypes);

    const initialCustomTags = searchParams.getAll('customTag');
    setSelectedCustomTags(initialCustomTags);

    const initialSpiceLevels = searchParams.getAll('spiceLevel').map(Number);
    setSpiceLevels(initialSpiceLevels);

    const initialIsHighRated = searchParams.get('highRated') === 'true';
    setIsHighRated(initialIsHighRated);

    const initialIsOpenNow = searchParams.get('openNow') === 'true';
    setIsOpenNow(initialIsOpenNow);

    const initialMaxDistance = Number(searchParams.get('maxDistance')) || 10;
    setMaxDistance(initialMaxDistance);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('q', searchQuery);
    selectedCuisineTypes.forEach(id => params.append('cuisineType', String(id)));
    selectedEstablishmentTypes.forEach(id => params.append('establishmentType', String(id)));
    selectedDietTypes.forEach(id => params.append('dietType', String(id)));
    selectedDishDietTypes.forEach(type => params.append('dishDietType', type));
    selectedPriceRanges.forEach(range => params.append('priceRange', range));
    selectedFoodTypes.forEach(id => params.append('foodType', String(id)));
    selectedCustomTags.forEach(tag => params.append('customTag', tag));
    spiceLevels.forEach(level => params.append('spiceLevel', String(level)));
    if (isHighRated) params.set('highRated', 'true');
    if (isOpenNow) params.set('openNow', 'true');
    if (maxDistance !== 10) params.set('maxDistance', String(maxDistance));

    router.push(`/?${params.toString()}`, { scroll: false });
  }, [
    searchQuery,
    selectedCuisineTypes,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedDishDietTypes,
    selectedPriceRanges,
    selectedFoodTypes,
    selectedCustomTags,
    spiceLevels,
    isHighRated,
    isOpenNow,
    maxDistance,
    router
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRestaurantSortChange = (sortBy: string) => {
    setRestaurantSortBy(sortBy);
  };

  const handleDishSortChange = (sortBy: string) => {
    setDishSortBy(sortBy);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <SearchBar onSearch={handleSearch} initialSearchQuery={searchQuery} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <FilterTags
          cuisineTypes={cuisineTypes}
          establishmentTypes={establishmentTypes}
          dietTypes={dietTypes}
          foodTypes={foodTypes}
          selectedCuisineTypes={selectedCuisineTypes}
          selectedEstablishmentTypes={selectedEstablishmentTypes}
          selectedDietTypes={selectedDietTypes}
          selectedDishDietTypes={selectedDishDietTypes}
          selectedPriceRanges={selectedPriceRanges}
          selectedFoodTypes={selectedFoodTypes}
          selectedCustomTags={selectedCustomTags}
          spiceLevels={spiceLevels}
          isHighRated={isHighRated}
          isOpenNow={isOpenNow}
          maxDistance={maxDistance}
          onCuisineTypeChange={setSelectedCuisineTypes}
          onEstablishmentTypeChange={setSelectedEstablishmentTypes}
          onDietTypeChange={setSelectedDietTypes}
          onDishDietTypeChange={setSelectedDishDietTypes}
          onPriceRangeChange={setSelectedPriceRanges}
          onFoodTypeChange={setSelectedFoodTypes}
          onCustomTagChange={setSelectedCustomTags}
          onSpiceLevelChange={setSpiceLevels}
          onHighRatedChange={setIsHighRated}
          onOpenNowChange={setIsOpenNow}
          onMaxDistanceChange={setMaxDistance}
          onOpenCuisineTypesModal={() => setIsCuisineTypesModalOpen(true)}
          onOpenEstablishmentTypesModal={() => setIsEstablishmentTypesModalOpen(true)}
          onOpenDietTypesModal={() => setIsDietTypesModalOpen(true)}
          onOpenPriceRangesModal={() => setIsPriceRangesModalOpen(true)}
          onOpenFoodTypesModal={() => setIsFoodTypesModalOpen(true)}
          onOpenCustomTagsModal={() => setIsCustomTagsModalOpen(true)}
          onOpenSpiceLevelsModal={() => setIsSpiceLevelsModalOpen(true)}
          currentTab={activeTab}
          restaurants={activeTab === 'restaurants' ? [] : undefined}
          dishes={activeTab === 'dishes' ? [] : undefined}
          onSortChange={activeTab === 'restaurants' ? handleRestaurantSortChange : handleDishSortChange}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                isHighRated={isHighRated}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietTypes={selectedDietTypes}
                maxDistance={maxDistance}
                isOpenNow={isOpenNow}
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

      <CuisineTypesModal
        isOpen={isCuisineTypesModalOpen}
        onClose={() => setIsCuisineTypesModalOpen(false)}
        cuisineTypes={cuisineTypes}
        selectedCuisineTypes={selectedCuisineTypes}
        onCuisineTypeChange={setSelectedCuisineTypes}
      />

      <EstablishmentTypesModal
        isOpen={isEstablishmentTypesModalOpen}
        onClose={() => setIsEstablishmentTypesModalOpen(false)}
        establishmentTypes={establishmentTypes}
        selectedEstablishmentTypes={selectedEstablishmentTypes}
        onEstablishmentTypeChange={setSelectedEstablishmentTypes}
      />

      <DietTypesModal
        isOpen={isDietTypesModalOpen}
        onClose={() => setIsDietTypesModalOpen(false)}
        dietTypes={dietTypes}
        selectedDietTypes={selectedDietTypes}
        onDietTypeChange={setSelectedDietTypes}
        selectedDishDietTypes={selectedDishDietTypes}
        onDishDietTypeChange={setSelectedDishDietTypes}
      />

      <PriceRangesModal
        isOpen={isPriceRangesModalOpen}
        onClose={() => setIsPriceRangesModalOpen(false)}
        selectedPriceRanges={selectedPriceRanges}
        onPriceRangeChange={setSelectedPriceRanges}
      />

      <FoodTypesModal
        isOpen={isFoodTypesModalOpen}
        onClose={() => setIsFoodTypesModalOpen(false)}
        foodTypes={foodTypes}
        selectedFoodTypes={selectedFoodTypes}
        onFoodTypeChange={setSelectedFoodTypes}
      />

      <CustomTagsModal
        isOpen={isCustomTagsModalOpen}
        onClose={() => setIsCustomTagsModalOpen(false)}
        selectedCustomTags={selectedCustomTags}
        onCustomTagChange={setSelectedCustomTags}
      />

      <SpiceLevelsModal
        isOpen={isSpiceLevelsModalOpen}
        onClose={() => setIsSpiceLevelsModalOpen(false)}
        selectedSpiceLevels={spiceLevels}
        onSpiceLevelChange={setSpiceLevels}
      />
    </div>
  );
}
