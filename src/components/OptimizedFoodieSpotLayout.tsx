
import { useState, useEffect } from 'react';
import { useOptimizedRestaurants } from '@/hooks/useOptimizedRestaurants';
import { useOptimizedDishes } from '@/hooks/useOptimizedDishes';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import DishesGrid from './DishesGrid';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OptimizedFoodieSpotLayoutProps {
  initialTab?: 'dishes' | 'restaurants';
}

export default function OptimizedFoodieSpotLayout({ 
  initialTab = 'dishes' 
}: OptimizedFoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<("€" | "€€" | "€€€" | "€€€€")[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [isHighRated, setIsHighRated] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(false);
  const [isBudgetFriendly, setIsBudgetFriendly] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Use optimized hooks
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useOptimizedRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisineTypes,
    priceRanges: selectedPriceRanges,
    isHighRated,
    selectedEstablishmentTypes,
    selectedDietTypes,
    isOpenNow,
    isBudgetFriendly
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useOptimizedDishes({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    selectedDietTypes,
    selectedPriceRanges
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Buscar platos o restaurantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Quick Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setIsHighRated(!isHighRated)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isHighRated 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alta puntuación (4.5+)
          </button>
          <button
            onClick={() => setIsOpenNow(!isOpenNow)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isOpenNow 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Abierto ahora
          </button>
          <button
            onClick={() => setIsBudgetFriendly(!isBudgetFriendly)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isBudgetFriendly 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Económico (€)
          </button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dishes' | 'restaurants')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dishes">
              Platos {!dishesLoading && `(${dishes.length})`}
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              Restaurantes {!restaurantsLoading && `(${restaurants.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dishes">
            <DishesGrid 
              dishes={dishes} 
              loading={dishesLoading} 
              error={dishesError} 
            />
          </TabsContent>

          <TabsContent value="restaurants">
            {restaurantsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
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
            ) : restaurantsError ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Error al cargar restaurantes: {restaurantsError}</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron restaurantes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Intenta cambiar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    description={restaurant.description}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type_name}
                    services={restaurant.services}
                    favoritesCount={restaurant.favorites_count}
                    coverImageUrl={restaurant.cover_image_url}
                    logoUrl={restaurant.logo_url}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
