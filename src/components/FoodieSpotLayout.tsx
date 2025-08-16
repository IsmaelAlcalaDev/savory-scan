import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import DishSearchBar from '@/components/DishSearchBar';
import CuisineFilter from '@/components/CuisineFilter';
import RestaurantCard from '@/components/RestaurantCard';
import FilterTags from '@/components/FilterTags';
import UnifiedFiltersModal from '@/components/UnifiedFiltersModal';
import ViewModeToggle from '@/components/ViewModeToggle';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDebounce } from '@/hooks/useDebounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { restaurants, loading, error } = useRestaurants({
    query: debouncedSearchQuery,
    cuisineIds: selectedCuisines,
    serviceIds: selectedServices,
    priceRanges: selectedPriceRanges,
    establishmentTypes: selectedEstablishmentTypes,
    sortBy: selectedSort,
  });

  const filteredRestaurants = restaurants;

  const resetFilters = () => {
    setSelectedServices([]);
    setSelectedCuisines([]);
    setSelectedPriceRanges([]);
    setSelectedEstablishmentTypes([]);
    setSelectedSort('nearest');
    setSearchQuery('');
  };

  useEffect(() => {
    console.log('FoodieSpotLayout state:', {
      activeTab,
      searchQuery,
      selectedCuisines,
      selectedServices,
      selectedPriceRanges,
      selectedEstablishmentTypes,
      selectedSort,
      viewMode,
      restaurants,
      loading,
      error,
    });
  }, [activeTab, searchQuery, selectedCuisines, selectedServices, selectedPriceRanges, selectedEstablishmentTypes, selectedSort, viewMode, restaurants, loading, error]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button variant="link" className="mr-4">FoodieSpot</Button>
            <Tabs defaultValue={initialTab} className="hidden md:flex">
              <TabsList>
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                <TabsTrigger value="dishes">Dishes</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-20 md:pb-8">
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            {/* Search Section */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm pb-4">
              <div className="space-y-4">
                <DishSearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder="Buscar restaurantes..."
                />

                {/* Cuisine Filter */}
                <CuisineFilter
                  selectedCuisines={selectedCuisines}
                  onCuisineChange={setSelectedCuisines}
                />
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {/* Header with filters and results count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">
                      {filteredRestaurants.length} restaurante{filteredRestaurants.length !== 1 ? 's' : ''} cerca de ti
                    </h2>
                    {(selectedServices.length > 0 || selectedCuisines.length > 0 || selectedPriceRanges.length > 0 || selectedEstablishmentTypes.length > 0 || searchQuery) && (
                      <button
                        onClick={resetFilters}
                        className="text-sm text-black hover:text-black transition-none"
                      >
                        Restablecer
                      </button>
                    )}
                  </div>
                  
                  {/* Active filters */}
                  <FilterTags
                    selectedServices={selectedServices}
                    selectedCuisines={selectedCuisines}
                    selectedPriceRanges={selectedPriceRanges}
                    selectedEstablishmentTypes={selectedEstablishmentTypes}
                    onRemoveService={(serviceId) => setSelectedServices(prev => prev.filter(id => id !== serviceId))}
                    onRemoveCuisine={(cuisineId) => setSelectedCuisines(prev => prev.filter(id => id !== cuisineId))}
                    onRemovePriceRange={(priceId) => setSelectedPriceRanges(prev => prev.filter(id => id !== priceId))}
                    onRemoveEstablishmentType={(typeId) => setSelectedEstablishmentTypes(prev => prev.filter(id => id !== typeId))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <UnifiedFiltersModal
                    selectedServices={selectedServices}
                    selectedCuisines={selectedCuisines}
                    selectedPriceRanges={selectedPriceRanges}
                    selectedEstablishmentTypes={selectedEstablishmentTypes}
                    selectedSort={selectedSort}
                    onServicesChange={setSelectedServices}
                    onCuisinesChange={setSelectedCuisines}
                    onPriceRangesChange={setSelectedPriceRanges}
                    onEstablishmentTypesChange={setSelectedEstablishmentTypes}
                    onSortChange={setSelectedSort}
                    isOpen={isFiltersModalOpen}
                    onOpenChange={setIsFiltersModalOpen}
                  />
                  <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-40 w-full rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-red-500">Error: {error.message}</div>
              ) : filteredRestaurants.length === 0 ? (
                <div className="text-muted-foreground">No restaurants found.</div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      id={restaurant.id}
                      name={restaurant.name}
                      slug={restaurant.slug}
                      description={restaurant.description}
                      priceRange={restaurant.priceRange}
                      googleRating={restaurant.googleRating}
                      googleRatingCount={restaurant.googleRatingCount}
                      distance={restaurant.distance}
                      cuisineTypes={restaurant.cuisineTypes.map(cuisine => cuisine.name)}
                      establishmentType={restaurant.establishmentType?.name}
                      services={restaurant.services?.map(service => service.name)}
                      favoritesCount={restaurant.favoritesCount}
                      coverImageUrl={restaurant.coverImageUrl}
                      logoUrl={restaurant.logoUrl}
                      layout={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dishes' && (
          <div>
            <h2>Dishes Tab Content</h2>
            <p>Content for the dishes tab will go here.</p>
          </div>
        )}
      </main>

      {/* Modals */}
    </div>
  );
}
