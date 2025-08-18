import { useState, useEffect, useMemo } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useDietTypes } from '@/hooks/useDietTypes';
import SearchBar from './SearchBar';
import LocationInfo from './LocationInfo';
import CuisineFilter from './CuisineFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import PriceFilter from './PriceFilter';
import DietFilter from './DietFilter';
import FilterTags from './FilterTags';
import { LoadMoreButton } from './LoadMoreButton';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import UnifiedRestaurantsTab from './UnifiedRestaurantsTab';

export default function FoodieSpotLayout() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [isHighRated, setIsHighRated] = useState<boolean>(false);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);

  const { userLocation, updateUserPreferences } = useUserPreferences();
  const { cuisineTypes, loading: loadingCuisineTypes, error: errorCuisineTypes } = useCuisineTypes();
  const { establishmentTypes, loading: loadingEstablishmentTypes, error: errorEstablishmentTypes } = useEstablishmentTypes();
  const { priceRanges, loading: loadingPriceRanges, error: errorPriceRanges } = usePriceRanges();
  const { dietTypes, loading: loadingDietTypes, error: errorDietTypes } = useDietTypes();

  useEffect(() => {
    if (userLocation) {
      console.log('FoodieSpotLayout: User location =', userLocation);
    }
  }, [userLocation]);

  const handleCuisineToggle = (cuisineId: number) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisineId) ? prev.filter((id) => id !== cuisineId) : [...prev, cuisineId]
    );
  };

  const handleEstablishmentTypeToggle = (typeId: number) => {
    setSelectedEstablishmentTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const handlePriceRangeToggle = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleDietTypeToggle = (dietTypeId: number) => {
    setSelectedDietTypes((prev) =>
      prev.includes(dietTypeId) ? prev.filter((id) => id !== dietTypeId) : [...prev, dietTypeId]
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">FoodieSpot</h1>
              <p className="text-muted-foreground mt-1">
                Descubre los mejores restaurantes cerca de ti
              </p>
            </div>
            <LocationInfo />
          </div>

          <SearchBar 
            onSearch={setSearchQuery}
            placeholder="Buscar restaurantes..."
          />
        </div>

        {/* Filters Section */}
        <div className="space-y-4 mb-6">
          <CuisineFilter
            selectedCuisines={selectedCuisines}
            onCuisineToggle={handleCuisineToggle}
          />
          
          <EstablishmentTypeFilter
            selectedTypes={selectedEstablishmentTypes}
            onTypeToggle={handleEstablishmentTypeToggle}
          />

          <PriceFilter
            selectedRanges={selectedPriceRanges}
            onRangeToggle={handlePriceRangeToggle}
          />

          <DietFilter
            selectedDietTypes={selectedDietTypes}
            onDietTypeToggle={handleDietTypeToggle}
          />

          <FilterTags
            searchQuery={searchQuery}
            selectedCuisines={selectedCuisines}
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            selectedPriceRanges={selectedPriceRanges}
            selectedDietTypes={selectedDietTypes}
            isHighRated={isHighRated}
            isOpenNow={isOpenNow}
            onClearSearch={() => setSearchQuery('')}
            onRemoveCuisine={handleCuisineToggle}
            onRemoveEstablishmentType={handleEstablishmentTypeToggle}
            onRemovePriceRange={handlePriceRangeToggle}
            onRemoveDietType={handleDietTypeToggle}
            onToggleHighRated={() => setIsHighRated(!isHighRated)}
            onToggleOpenNow={() => setIsOpenNow(!isOpenNow)}
          />
        </div>

        {/* Restaurants Section */}
        <UnifiedRestaurantsTab
          searchQuery={searchQuery}
          cuisineTypeIds={selectedCuisines}
          priceRanges={selectedPriceRanges}
          isHighRated={isHighRated}
          selectedEstablishmentTypes={selectedEstablishmentTypes}
          selectedDietTypes={selectedDietTypes}
          isOpenNow={isOpenNow}
        />
      </div>
    </main>
  );
}
