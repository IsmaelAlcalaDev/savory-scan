import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DesktopHeader from '@/components/DesktopHeader';
import TabletHeader from '@/components/TabletHeader';
import MobileHeader from '@/components/MobileHeader';
import SearchBar from '@/components/SearchBar';
import QuickActionTags from '@/components/QuickActionTags';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import RestaurantCard from '@/components/RestaurantCard';
import AllDishCard from '@/components/AllDishCard';
import LocationModal from '@/components/LocationModal';
import ViewModeToggle from '@/components/ViewModeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import { useMobile } from '@/hooks/use-mobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useIPLocation } from '@/hooks/useIPLocation';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  price_range: string;
  google_rating: number;
  google_rating_count: number;
  distance: number;
  cuisine_types: { id: number; name: string }[];
  establishment_type: { id: number; name: string } | null;
  services: { id: number; name: string }[];
  favorites_count: number;
  cover_image_url: string;
  logo_url: string;
}

interface DishData {
  id: number;
  name: string;
  basePrice: number;
  restaurantName: string;
  cuisineType: string;
}

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes';
}

type ViewMode = 'grid' | 'list';

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const { profile: userProfile, loading: profileLoading } = useUserProfile();
  const { findNearestLocation, loading: locationLoading } = useNearestLocation();
  const { data: ipLocation } = useIPLocation();

  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  const isMobile = useMobile();

  // Fetch restaurants data
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants({
    searchQuery,
    cuisineTypeIds: selectedCuisines,
    currentLocation,
  });

  // Fetch dishes data
  const { data: dishes = [], isLoading: dishesLoading } = useDishes({
    searchQuery,
    cuisineTypeIds: selectedCuisines,
    selectedFoodTypes,
    currentLocation,
  });

  // Auto-detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      if (ipLocation?.latitude && ipLocation?.longitude) {
        try {
          const nearest = await findNearestLocation(ipLocation.latitude, ipLocation.longitude);
          if (nearest) {
            setCurrentLocation({
              latitude: ipLocation.latitude,
              longitude: ipLocation.longitude,
              address: nearest.displayName || `${ipLocation.latitude}, ${ipLocation.longitude}`
            });
          } else {
            setCurrentLocation({
              latitude: ipLocation.latitude,
              longitude: ipLocation.longitude,
              address: `${ipLocation.latitude}, ${ipLocation.longitude}`
            });
          }
        } catch (error) {
          console.error('Error finding nearest location:', error);
          setCurrentLocation({
            latitude: ipLocation.latitude,
            longitude: ipLocation.longitude,
            address: `${ipLocation.latitude}, ${ipLocation.longitude}`
          });
        }
      }
    };

    detectLocation();
  }, [ipLocation, findNearestLocation]);

  const handleLocationClick = () => {
    setIsLocationModalOpen(true);
  };

  const handleLocationSelect = (location: any) => {
    setCurrentLocation(location);
    setIsLocationModalOpen(false);
    toast.success('Ubicación actualizada');
  };

  const handleFavoritesRefresh = () => {
    // Trigger a refetch of data when favorites change
    window.location.reload();
  };

  const isLoading = restaurantsLoading || dishesLoading || profileLoading || locationLoading;
  const currentData = activeTab === 'restaurants' ? restaurants : dishes;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        {isMobile ? (
          <MobileHeader onLocationClick={handleLocationClick} />
        ) : (
          <>
            <div className="hidden lg:block">
              <DesktopHeader onLocationClick={handleLocationClick} />
            </div>
            <div className="hidden md:block lg:hidden">
              <TabletHeader onLocationClick={handleLocationClick} />
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <div className="flex-1 max-w-md w-full">
              <SearchBar
                onChange={setSearchQuery}
                placeholder={activeTab === 'restaurants' ? 'Buscar restaurantes...' : 'Buscar platos...'}
              />
            </div>
          </div>

          {/* Quick Action Tags */}
          <QuickActionTags 
            onFavoritesClick={handleFavoritesRefresh}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={activeTab === 'restaurants' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('restaurants')}
              className="px-6 py-2"
            >
              Restaurantes
            </Button>
            <Button
              variant={activeTab === 'dishes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dishes')}
              className="px-6 py-2"
            >
              Platos
            </Button>
          </div>

          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <CuisineFilter
            selectedCuisines={selectedCuisines}
            onCuisinesChange={setSelectedCuisines}
          />
          {activeTab === 'dishes' && (
            <FoodTypeFilter
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypesChange={setSelectedFoodTypes}
            />
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron {activeTab === 'restaurants' ? 'restaurantes' : 'platos'}
              </h3>
              <p className="text-gray-500">
                Intenta ajustar tus filtros o buscar algo diferente.
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {activeTab === 'dishes' ? (
                (currentData as DishData[]).map((dish) => (
                  <AllDishCard
                    key={dish.id}
                    id={dish.id}
                    name={dish.name}
                    basePrice={dish.basePrice}
                    restaurantName={dish.restaurantName}
                    cuisineType={dish.cuisineType}
                    layout={viewMode}
                  />
                ))
              ) : (
                (currentData as Restaurant[]).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    googleRatingCount={restaurant.google_rating_count}
                    distance={restaurant.distance}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                    services={restaurant.services}
                    favoritesCount={restaurant.favorites_count}
                    coverImageUrl={restaurant.cover_image_url}
                    logoUrl={restaurant.logo_url}
                    onFavoriteChange={handleFavoritesRefresh}
                    layout={viewMode}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
        onLocationSelect={handleLocationSelect}
      />

      {/* Bottom Navigation */}
      {isMobile && (
        <BottomNavigation />
      )}
    </div>
  );
}
