import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FilterTags from '@/components/FilterTags';
import RestaurantList from '@/components/RestaurantList';
import { useDebounce } from '@/hooks/use-debounce';

interface FoodieSpotLayoutProps {
  initialTab?: string;
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || initialTab);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>();
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);
  
  const [selectedSort, setSelectedSort] = useState<string>('relevance');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const newParams = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      newParams.set('q', e.target.value);
    } else {
      newParams.delete('q');
    }
    navigate(`?${newParams.toString()}`, { replace: true });
  };

  const handleCuisineChange = (cuisineId: number) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisineId)
        ? prev.filter((id) => id !== cuisineId)
        : [...prev, cuisineId]
    );
  };

  const handleFoodTypeChange = (foodTypeId: number) => {
    setSelectedFoodTypes((prev) =>
      prev.includes(foodTypeId)
        ? prev.filter((id) => id !== foodTypeId)
        : [...prev, foodTypeId]
    );
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(priceRange)
        ? prev.filter((range) => range !== priceRange)
        : [...prev, priceRange]
    );
  };

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleEstablishmentTypeChange = (establishmentTypeId: number) => {
    setSelectedEstablishmentTypes((prev) =>
      prev.includes(establishmentTypeId)
        ? prev.filter((id) => id !== establishmentTypeId)
        : [...prev, establishmentTypeId]
    );
  };

  const handleDietTypeChange = (dietTypeId: number) => {
    setSelectedDietTypes((prev) =>
      prev.includes(dietTypeId)
        ? prev.filter((id) => id !== dietTypeId)
        : [...prev, dietTypeId]
    );
  };

  const handleOpenNowChange = () => {
    setIsOpenNow((prev) => !prev);
  };
  
  const handleSortChange = (sortId: string) => {
    setSelectedSort(sortId);
    console.log('Sort changed to:', sortId);
  };

  const handleDistanceChange = (distances: number[]) => {
    setSelectedDistance(distances);
    console.log('Distance changed to:', distances);
  };

  const handleClearFilter = (type: 'cuisine' | 'foodType' | 'distance' | 'price' | 'rating' | 'establishment' | 'diet' | 'openNow' | 'sort' | 'all', id?: number) => {
    switch (type) {
      case 'sort':
        setSelectedSort('relevance');
        break;
      case 'distance':
        setSelectedDistance([]);
        break;
      case 'cuisine':
        setSelectedCuisines([]);
        break;
      case 'foodType':
        setSelectedFoodTypes([]);
        break;
      case 'price':
        setSelectedPriceRanges([]);
        break;
      case 'rating':
        setSelectedRating(undefined);
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
      case 'all':
        setSelectedCuisines([]);
        setSelectedFoodTypes([]);
        setSelectedDistance([]);
        setSelectedPriceRanges([]);
        setSelectedRating(undefined);
        setSelectedEstablishmentTypes([]);
        setSelectedDietTypes([]);
        setIsOpenNow(false);
        setSelectedSort('relevance');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">FoodieSpot</h1>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
            <TabsList>
              <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes">Platos</TabsTrigger>
            </TabsList>
            <TabsContent value="restaurants">
              <div className="grid gap-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar restaurantes..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2"
                      onClick={() => {
                        setSearchQuery('');
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('q');
                        navigate(`?${newParams.toString()}`, { replace: true });
                      }}
                    >
                      Borrar
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="dishes">
              <div className="grid gap-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Buscar platos..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-2"
                      onClick={() => {
                        setSearchQuery('');
                        const newParams = new URLSearchParams(searchParams.toString());
                        newParams.delete('q');
                        navigate(`?${newParams.toString()}`, { replace: true });
                      }}
                    >
                      Borrar
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Filter Tags */}
          <FilterTags
            activeTab={activeTab as 'restaurants' | 'dishes'}
            selectedCuisines={selectedCuisines}
            selectedFoodTypes={selectedFoodTypes}
            selectedDistance={selectedDistance}
            selectedPriceRanges={selectedPriceRanges}
            selectedRating={selectedRating}
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            selectedDietTypes={selectedDietTypes}
            selectedSort={selectedSort}
            isOpenNow={isOpenNow}
            onClearFilter={handleClearFilter}
            onSortChange={handleSortChange}
            onDistanceChange={handleDistanceChange}
          />

          {/* Restaurant List */}
          <RestaurantList
            searchQuery={debouncedSearchQuery}
            activeTab={activeTab as 'restaurants' | 'dishes'}
            selectedCuisines={selectedCuisines}
            selectedFoodTypes={selectedFoodTypes}
            selectedPriceRanges={selectedPriceRanges}
            selectedRating={selectedRating}
            selectedEstablishmentTypes={selectedEstablishmentTypes}
            selectedDietTypes={selectedDietTypes}
            selectedSort={selectedSort}
          />
        </div>
      </main>

      <footer className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} FoodieSpot. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
