
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBar from './SearchBar';
import UnifiedFiltersModal from './UnifiedFiltersModal';
import UnifiedRestaurantsTab from './UnifiedRestaurantsTab';
import DishesGrid from './DishesGrid';
import FilterTags from './FilterTags';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { LayoutStabilizer } from './LayoutStabilizer';

export default function FoodieSpotLayout() {
  const { userLocation } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [isHighRated, setIsHighRated] = useState(false);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietCategories, setSelectedDietCategories] = useState<string[]>([]);
  const [selectedDishDietTypes, setSelectedDishDietTypes] = useState<string[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedCustomTags, setSelectedCustomTags] = useState<string[]>([]);
  const [spiceLevels, setSpiceLevels] = useState<number[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurantes');
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCuisineTypes([]);
    setSelectedPriceRanges([]);
    setIsHighRated(false);
    setSelectedEstablishmentTypes([]);
    setSelectedDietCategories([]);
    setSelectedDishDietTypes([]);
    setSelectedFoodTypes([]);
    setSelectedCustomTags([]);
    setSpiceLevels([]);
    setMaxDistance(50);
    setIsOpenNow(false);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    selectedCuisineTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    isHighRated ||
    selectedEstablishmentTypes.length > 0 ||
    selectedDietCategories.length > 0 ||
    selectedDishDietTypes.length > 0 ||
    selectedFoodTypes.length > 0 ||
    selectedCustomTags.length > 0 ||
    spiceLevels.length > 0 ||
    isOpenNow;

  return (
    <LayoutStabilizer>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Search Section */}
          <div className="mb-6">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              onFiltersClick={() => setIsFiltersModalOpen(true)}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Filter Tags */}
          {hasActiveFilters && (
            <div className="mb-6">
              <FilterTags
                selectedCuisineTypes={selectedCuisineTypes}
                selectedPriceRanges={selectedPriceRanges}
                isHighRated={isHighRated}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietCategories={selectedDietCategories}
                selectedDishDietTypes={selectedDishDietTypes}
                selectedFoodTypes={selectedFoodTypes}
                selectedCustomTags={selectedCustomTags}
                spiceLevels={spiceLevels}
                isOpenNow={isOpenNow}
                onClearAll={clearAllFilters}
                onRemoveCuisineType={(id) => setSelectedCuisineTypes(prev => prev.filter(c => c !== id))}
                onRemovePriceRange={(range) => setSelectedPriceRanges(prev => prev.filter(p => p !== range))}
                onRemoveHighRated={() => setIsHighRated(false)}
                onRemoveEstablishmentType={(id) => setSelectedEstablishmentTypes(prev => prev.filter(e => e !== id))}
                onRemoveDietCategory={(category) => setSelectedDietCategories(prev => prev.filter(d => d !== category))}
                onRemoveDishDietType={(type) => setSelectedDishDietTypes(prev => prev.filter(d => d !== type))}
                onRemoveFoodType={(id) => setSelectedFoodTypes(prev => prev.filter(f => f !== id))}
                onRemoveCustomTag={(tag) => setSelectedCustomTags(prev => prev.filter(t => t !== tag))}
                onRemoveSpiceLevel={(level) => setSpiceLevels(prev => prev.filter(s => s !== level))}
                onRemoveOpenNow={() => setIsOpenNow(false)}
              />
            </div>
          )}

          {/* Main Content */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="restaurantes">Restaurantes</TabsTrigger>
                  <TabsTrigger value="platos">Platos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="restaurantes" className="mt-6">
                  <UnifiedRestaurantsTab
                    searchQuery={searchQuery}
                    cuisineTypeIds={selectedCuisineTypes}
                    priceRanges={selectedPriceRanges}
                    isHighRated={isHighRated}
                    selectedEstablishmentTypes={selectedEstablishmentTypes}
                    selectedDietCategories={selectedDietCategories}
                    maxDistance={maxDistance}
                    isOpenNow={isOpenNow}
                  />
                </TabsContent>
                
                <TabsContent value="platos" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold">Platos</h2>
                    </div>

                    <DishesGrid
                      searchQuery={searchQuery}
                      userLat={userLocation?.latitude}
                      userLng={userLocation?.longitude}
                      selectedDishDietTypes={selectedDishDietTypes}
                      selectedPriceRanges={selectedPriceRanges}
                      selectedFoodTypes={selectedFoodTypes}
                      selectedCustomTags={selectedCustomTags}
                      spiceLevels={spiceLevels}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Filters Modal */}
          <UnifiedFiltersModal
            isOpen={isFiltersModalOpen}
            onClose={() => setIsFiltersModalOpen(false)}
            selectedCuisineTypes={selectedCuisineTypes}
            selectedPriceRanges={selectedPriceRanges}
            isHighRated={isHighRated}
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            selectedDietCategories={selectedDietCategories}
            selectedDishDietTypes={selectedDishDietTypes}
            selectedFoodTypes={selectedFoodTypes}
            selectedCustomTags={selectedCustomTags}
            spiceLevels={spiceLevels}
            maxDistance={maxDistance}
            isOpenNow={isOpenNow}
            onCuisineTypesChange={setSelectedCuisineTypes}
            onPriceRangesChange={setSelectedPriceRanges}
            onHighRatedChange={setIsHighRated}
            onEstablishmentTypesChange={setSelectedEstablishmentTypes}
            onDietCategoriesChange={setSelectedDietCategories}
            onDishDietTypesChange={setSelectedDishDietTypes}
            onFoodTypesChange={setSelectedFoodTypes}
            onCustomTagsChange={setSelectedCustomTags}
            onSpiceLevelsChange={setSpiceLevels}
            onMaxDistanceChange={setMaxDistance}
            onOpenNowChange={setIsOpenNow}
            onClearAll={clearAllFilters}
            currentTab={activeTab}
          />
        </div>
      </div>
    </LayoutStabilizer>
  );
}
