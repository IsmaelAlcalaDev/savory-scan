import { useState, useEffect, useMemo } from 'react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useCachedRestaurantFeed } from '@/hooks/useCachedRestaurantFeed';
import { useDishes } from '@/hooks/useDishes';
import RestaurantSortSelector from './RestaurantSortSelector';
import RestaurantCard from './RestaurantCard';
import DishesGrid from './DishesGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CacheDebugPanel from './CacheDebugPanel';
import SimpleDietFilterWithCounts from './SimpleDietFilterWithCounts';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const { userLocation } = useUserPreferences();
  const [activeBottomTab, setActiveBottomTab] = useState(initialTab);
  
  // Search states
  const [searchQueryRestaurants, setSearchQueryRestaurants] = useState('');
  const [searchQueryDishes, setSearchQueryDishes] = useState('');
  
  // Filter states
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedDietCategories, setSelectedDietCategories] = useState<string[]>([]);
  const [isHighRated, setIsHighRated] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  
  // Sort states
  const [sortByRestaurants, setSortByRestaurants] = useState<'distance' | 'rating' | 'favorites'>(
    userLocation ? 'distance' : 'favorites'
  );

  const hasLocation = Boolean(userLocation?.latitude && userLocation?.longitude);

  // ✅ CACHED RESTAURANT FEED (Redis + Edge Function)
  const { 
    restaurants, 
    loading: restaurantsLoading, 
    error: restaurantsError,
    cacheMetrics 
  } = useCachedRestaurantFeed({
    searchQuery: searchQueryRestaurants,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    maxDistance,
    cuisineTypeIds: selectedCuisineTypes,
    priceRanges: selectedPriceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietCategories,
    sortBy: sortByRestaurants
  });

  // Dishes hook remains the same
  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery: searchQueryDishes,
    userLat: userLocation?.latitude,
    userLng: userLocation?.longitude,
    selectedDietTypes,
    selectedDishDietTypes: selectedDietCategories,
    selectedPriceRanges,
    selectedFoodTypes: [],
    selectedCustomTags: [],
    spiceLevels: []
  });

  useEffect(() => {
    console.log('FoodieSpotLayout: Current state', {
      activeBottomTab,
      restaurantsCount: restaurants.length,
      dishesCount: dishes.length,
      userLocation,
      filters: {
        selectedCuisineTypes,
        selectedPriceRanges,
        selectedEstablishmentTypes,
        selectedDietTypes,
        selectedDietCategories,
        isHighRated,
        maxDistance
      }
    });
  }, [
    activeBottomTab,
    restaurants.length,
    dishes.length,
    userLocation,
    selectedCuisineTypes,
    selectedPriceRanges,
    selectedEstablishmentTypes,
    selectedDietTypes,
    selectedDietCategories,
    isHighRated,
    maxDistance
  ]);

  const RestaurantsTabContent = () => {
    if (restaurantsLoading) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Restaurantes</h2>
            <div className="flex gap-2">
              <SimpleDietFilterWithCounts
                selectedDietCategories={selectedDietCategories}
                onDietCategoryChange={setSelectedDietCategories}
                userLat={userLocation?.latitude}
                userLng={userLocation?.longitude}
              />
              <RestaurantSortSelector
                value={sortByRestaurants}
                onChange={setSortByRestaurants}
                hasLocation={hasLocation}
              />
            </div>
          </div>

          {/* Cache Debug Panel (always visible in development) */}
          {process.env.NODE_ENV === 'development' && (
            <CacheDebugPanel metrics={cacheMetrics} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (restaurantsError) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Restaurantes</h2>
            <div className="flex gap-2">
              <SimpleDietFilterWithCounts
                selectedDietCategories={selectedDietCategories}
                onDietCategoryChange={setSelectedDietCategories}
                userLat={userLocation?.latitude}
                userLng={userLocation?.longitude}
              />
              <RestaurantSortSelector
                value={sortByRestaurants}
                onChange={setSortByRestaurants}
                hasLocation={hasLocation}
              />
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <CacheDebugPanel metrics={cacheMetrics} />
          )}
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">Error al cargar restaurantes: {restaurantsError}</p>
          </div>
        </div>
      );
    }

    if (restaurants.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Restaurantes</h2>
            <div className="flex gap-2">
              <SimpleDietFilterWithCounts
                selectedDietCategories={selectedDietCategories}
                onDietCategoryChange={setSelectedDietCategories}
                userLat={userLocation?.latitude}
                userLng={userLocation?.longitude}
              />
              <RestaurantSortSelector
                value={sortByRestaurants}
                onChange={setSortByRestaurants}
                hasLocation={hasLocation}
              />
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <CacheDebugPanel metrics={cacheMetrics} />
          )}
          
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron restaurantes</p>
            <p className="text-sm text-muted-foreground mt-2">
              Intenta cambiar los filtros de búsqueda
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Restaurantes</h2>
            {/* ✅ CACHE STATUS INDICATORS */}
            <div className="flex gap-2">
              <Badge 
                variant={cacheMetrics.cacheStatus === 'redis-hit' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {cacheMetrics.cacheStatus === 'redis-hit' ? '⚡ Cache' : 
                 cacheMetrics.cacheStatus === 'db-fallback' ? '🔄 DB' : '❓ Unknown'}
              </Badge>
              {cacheMetrics.avgLatency > 0 && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(cacheMetrics.avgLatency)}ms
                </Badge>
              )}
              {cacheMetrics.hitRate > 0 && (
                <Badge variant="outline" className="text-xs">
                  Hit: {cacheMetrics.hitRate.toFixed(1)}%
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <SimpleDietFilterWithCounts
              selectedDietCategories={selectedDietCategories}
              onDietCategoryChange={setSelectedDietCategories}
              userLat={userLocation?.latitude}
              userLng={userLocation?.longitude}
            />
            <RestaurantSortSelector
              value={sortByRestaurants}
              onChange={setSortByRestaurants}
              hasLocation={hasLocation}
            />
          </div>
        </div>

        {/* ✅ CACHE DEBUG PANEL (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <CacheDebugPanel metrics={cacheMetrics} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {restaurants.map((restaurant, index) => (
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
              cuisineTypes={restaurant.cuisine_types.map(ct => ct.name)}
              establishmentType={restaurant.establishment_type}
              services={restaurant.services}
              favoritesCount={restaurant.favorites_count}
              coverImageUrl={restaurant.cover_image_url}
              logoUrl={restaurant.logo_url}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    );
  };

  const DishesTabContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Platos</h2>
          <SimpleDietFilterWithCounts
            selectedDietCategories={selectedDietCategories}
            onDietCategoryChange={setSelectedDietCategories}
            userLat={userLocation?.latitude}
            userLng={userLocation?.longitude}
          />
        </div>
        
        <DishesGrid
          dishes={dishes}
          loading={dishesLoading}
          error={dishesError}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeBottomTab} onValueChange={(value) => setActiveBottomTab(value as 'restaurants' | 'dishes')} className="w-full">
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="restaurants" className="flex items-center gap-2">
                <span>Restaurantes</span>
                {restaurants.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {restaurants.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="dishes" className="flex items-center gap-2">
                <span>Platos</span>
                {dishes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dishes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <TabsContent value="restaurants" className="mt-0">
            <RestaurantsTabContent />
          </TabsContent>

          <TabsContent value="dishes" className="mt-0">
            <DishesTabContent />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
