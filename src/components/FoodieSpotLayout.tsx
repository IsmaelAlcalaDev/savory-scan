
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIPLocation } from '@/hooks/useIPLocation';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import DesktopHeader from './DesktopHeader';
import TabletHeader from './TabletHeader';
import MobileHeader from './MobileHeader';
import SearchBar from './SearchBar';
import CuisineFilter from './CuisineFilter';
import FoodTypeFilter from './FoodTypeFilter';
import ViewModeToggle from './ViewModeToggle';
import RestaurantCard from './RestaurantCard';
import AllDishCard from './AllDishCard';
import LocationModal from './LocationModal';
import BottomNavigation from './BottomNavigation';
import { Restaurant } from '@/types/restaurant';
import QuickActionTags from './QuickActionTags';

interface DishData {
  id: number;
  name: string;
  basePrice: number;
  restaurantName: string;
  restaurantId: number;
  cuisineType?: string;
}

type ViewMode = 'restaurants' | 'dishes' | 'account';

export default function FoodieSpotLayout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useUserProfile();
  const { location: ipLocation } = useIPLocation();
  
  // Estados principales
  const [viewMode, setViewMode] = useState<ViewMode>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [listMode, setListMode] = useState<'list' | 'grid'>('grid');
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Geolocalización
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const { nearestLocation } = useNearestLocation(userLocation?.lat || null, userLocation?.lng || null);

  // Hooks para datos
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery: viewMode === 'restaurants' ? searchQuery : '',
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useDishes({
    searchQuery: viewMode === 'dishes' ? searchQuery : '',
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    cuisineTypeIds: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    foodTypeIds: selectedFoodTypes.length > 0 ? selectedFoodTypes : undefined,
  });

  // Efectos
  useEffect(() => {
    const path = location.pathname;
    if (path === '/restaurantes') {
      setViewMode('restaurants');
    } else if (path === '/platos') {
      setViewMode('dishes');
    } else if (path === '/cuenta') {
      setViewMode('account');
    }
  }, [location.pathname]);

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
          console.error('Error getting user location:', error);
          if (ipLocation?.lat && ipLocation?.lng) {
            setUserLocation({
              lat: ipLocation.lat,
              lng: ipLocation.lng
            });
          }
        }
      );
    } else if (ipLocation?.lat && ipLocation?.lng) {
      setUserLocation({
        lat: ipLocation.lat,
        lng: ipLocation.lng
      });
    }
  }, [ipLocation]);

  // Handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'restaurants') {
      navigate('/restaurantes');
    } else if (mode === 'dishes') {
      navigate('/platos');
    } else if (mode === 'account') {
      navigate('/cuenta');
    }
  };

  const handleCuisineChange = (cuisines: number[]) => {
    setSelectedCuisines(cuisines);
  };

  const handleFoodTypeChange = (foodTypes: number[]) => {
    setSelectedFoodTypes(foodTypes);
  };

  const handleFavoriteChange = () => {
    // Recargar datos cuando cambie un favorito
    console.log('Favorite changed - data will refresh automatically');
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleFavoritesClick = () => {
    // Navegar a favoritos o mostrar modal de favoritos
    console.log('Navigate to favorites');
  };

  // Renderizado de header según dispositivo
  const renderHeader = () => {
    if (isMobile) {
      return (
        <MobileHeader 
          onLocationClick={handleLocationClick}
          address={nearestLocation?.formatted_address || ipLocation?.city || 'Ubicación no disponible'}
        />
      );
    } else {
      return (
        <>
          <DesktopHeader 
            onLocationClick={handleLocationClick}
            address={nearestLocation?.formatted_address || ipLocation?.city || 'Ubicación no disponible'}
          />
          <TabletHeader 
            onLocationClick={handleLocationClick}
            address={nearestLocation?.formatted_address || ipLocation?.city || 'Ubicación no disponible'}
          />
        </>
      );
    }
  };

  // Datos para mostrar según el modo de vista
  const getDisplayData = () => {
    if (viewMode === 'restaurants') {
      return {
        items: restaurants,
        loading: restaurantsLoading,
        error: restaurantsError
      };
    } else if (viewMode === 'dishes') {
      return {
        items: dishes,
        loading: dishesLoading,
        error: dishesError
      };
    }
    return { items: [], loading: false, error: null };
  };

  const { items, loading, error } = getDisplayData();

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      
      <main className="container mx-auto px-4 pt-20 pb-20 lg:pb-8">
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            placeholder={viewMode === 'restaurants' ? "Buscar restaurantes..." : "Buscar platos..."}
          />
        </div>

        {/* Quick Action Tags */}
        <div className="mb-6">
          <QuickActionTags 
            onLocationClick={handleLocationClick}
            onFavoritesClick={handleFavoritesClick}
            address={nearestLocation?.formatted_address || ipLocation?.city || 'Ubicación no disponible'}
          />
        </div>

        {/* Filtros de tipos de cocina */}
        <div className="mb-6">
          <CuisineFilter
            selectedCuisines={selectedCuisines}
            onCuisineChange={handleCuisineChange}
          />
        </div>

        {/* Filtros de tipos de comida (solo para platos) */}
        {viewMode === 'dishes' && (
          <div className="mb-6">
            <FoodTypeFilter
              selectedFoodTypes={selectedFoodTypes}
              onFoodTypeChange={handleFoodTypeChange}
            />
          </div>
        )}

        {/* Toggle de modo de vista y contador de resultados */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {viewMode === 'restaurants' ? 'Restaurantes' : 'Platos'}
              {!loading && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({items.length} resultados)
                </span>
              )}
            </h2>
          </div>
          
          <ViewModeToggle
            viewMode={listMode}
            onViewModeChange={setListMode}
          />
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Error al cargar los datos</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron resultados</p>
          </div>
        ) : (
          <div>
            {viewMode === 'dishes' ? (
              <div className={`grid gap-4 ${
                listMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {(items as DishData[]).map((dish) => (
                  <AllDishCard
                    key={dish.id}
                    id={dish.id}
                    name={dish.name}
                    basePrice={dish.basePrice}
                    restaurantName={dish.restaurantName}
                    restaurantId={dish.restaurantId}
                    cuisineType={dish.cuisineType}
                    viewMode={listMode}
                  />
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${
                listMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {(items as Restaurant[]).map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    priceRange={restaurant.price_range}
                    rating={restaurant.google_rating}
                    ratingCount={restaurant.google_rating_count}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                    services={restaurant.services}
                    favoritesCount={restaurant.favorites_count}
                    coverImageUrl={restaurant.cover_image_url}
                    logoUrl={restaurant.logo_url}
                    onFavoriteChange={handleFavoriteChange}
                    viewMode={listMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de ubicación */}
      <LocationModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
      />

      {/* Navegación inferior móvil */}
      <BottomNavigation 
        currentView={viewMode}
        onViewChange={handleViewModeChange}
      />
    </div>
  );
}
