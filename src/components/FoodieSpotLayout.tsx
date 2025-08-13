
import React, { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RestaurantCard from '@/components/RestaurantCard';
import AllDishCard from '@/components/AllDishCard';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import LocationModal from '@/components/LocationModal';
import FiltersModal from '@/components/FiltersModal';
import BottomNavigation from '@/components/BottomNavigation';
import DishModal from '@/components/DishModal';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useAllDishes } from '@/hooks/useAllDishes';
import { useIPLocation } from '@/hooks/useIPLocation';

export default function FoodieSpotLayout() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes'>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null }>({ latitude: null, longitude: null });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  // Filters state
  const [cuisineFilters, setCuisineFilters] = useState<number[]>([]);
  const [foodTypeFilters, setFoodTypeFilters] = useState<number[]>([]);
  const [priceRanges, setPriceRanges] = useState<('€' | '€€' | '€€€' | '€€€€')[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [dietTypes, setDietTypes] = useState<string[]>([]);

  const { location: ipLocation, loading: locationLoading, error: locationError } = useIPLocation();

  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants({
    searchQuery,
    userLat: location.latitude,
    userLng: location.longitude,
    maxDistance,
    cuisineTypeIds: cuisineFilters,
    priceRanges,
    minRating
  });

  const { dishes, loading: dishesLoading, error: dishesError } = useAllDishes({
    searchQuery,
    userLat: location.latitude,
    userLng: location.longitude,
    maxDistance,
    foodTypeIds: foodTypeFilters,
    priceRanges,
    minRating,
    dietTypes
  });

  useEffect(() => {
    if (ipLocation && ipLocation.latitude && ipLocation.longitude) {
      setLocation({ latitude: ipLocation.latitude, longitude: ipLocation.longitude });
    }
  }, [ipLocation]);

  const handleLocationSelect = (locationData: { type: "gps" | "manual" | "city" | "suggestion"; data?: any }) => {
    if (locationData.type === 'gps' && locationData.data) {
      setLocation({ latitude: locationData.data.latitude, longitude: locationData.data.longitude });
    } else if (locationData.type === 'manual' && locationData.data) {
      setLocation({ latitude: locationData.data.latitude, longitude: locationData.data.longitude });
    } else if (locationData.type === 'city' && locationData.data) {
      setLocation({ latitude: locationData.data.latitude, longitude: locationData.data.longitude });
    }
    setShowLocationModal(false);
  };

  const handlePriceRangeChange = (ranges: string[]) => {
    setPriceRanges(ranges as ('€' | '€€' | '€€€' | '€€€€')[]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-secondary py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setShowLocationModal(true)}>
              <MapPin className="h-5 w-5 mr-2" />
              <span className="text-sm">
                {location.latitude ? `Cerca de ti` : 'Seleccionar ubicación'}
              </span>
            </Button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-grow mx-4">
            <Input
              type="search"
              placeholder={`Buscar ${activeTab === 'restaurants' ? 'restaurantes' : 'platos'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Button variant="outline" size="icon" onClick={() => setShowFiltersModal(true)}>
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-4 py-6 space-y-6">
        {/* Types Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {activeTab === 'restaurants' ? 'Tipos de cocina' : 'Tipos de comida'}
          </h3>
          {activeTab === 'restaurants' ? (
            <CuisineFilter
              selectedCuisines={cuisineFilters}
              onCuisineChange={setCuisineFilters}
            />
          ) : (
            <FoodTypeFilter
              selectedFoodTypes={foodTypeFilters}
              onFoodTypeChange={setFoodTypeFilters}
            />
          )}
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap gap-2">
          {priceRanges.length > 0 && (
            <div>
              <Badge variant="secondary">
                Precio: {priceRanges.join(', ')}
              </Badge>
            </div>
          )}
          {minRating > 0 && (
            <div>
              <Badge variant="secondary">
                Rating: {minRating}+
              </Badge>
            </div>
          )}
          {maxDistance < 50 && (
            <div>
              <Badge variant="secondary">
                Distancia: {maxDistance} km
              </Badge>
            </div>
          )}
          {dietTypes.length > 0 && (
            <div>
              <Badge variant="secondary">
                Dietas: {dietTypes.join(', ')}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="px-4 pb-20">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            {activeTab === 'restaurants' ? 'Restaurantes' : 'Platos'}
          </h2>
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'restaurants' ? (
            restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                {...restaurant}
                onClick={() => console.log('Restaurant clicked:', restaurant.id)}
              />
            ))
          ) : (
            dishes.map((dish) => (
              <AllDishCard
                key={dish.id}
                dish={dish}
                onFavoriteClick={() => console.log('Favorite clicked:', dish.id)}
                onCardClick={() => setSelectedDish(dish)}
              />
            ))
          )}
        </div>

        {/* Empty State */}
        {activeTab === 'restaurants' && restaurants.length === 0 && !restaurantsLoading && (
          <div className="text-center text-muted-foreground">
            No se encontraron restaurantes con los filtros seleccionados.
          </div>
        )}

        {activeTab === 'dishes' && dishes.length === 0 && !dishesLoading && (
          <div className="text-center text-muted-foreground">
            No se encontraron platos con los filtros seleccionados.
          </div>
        )}

        {/* Loading State */}
        {(activeTab === 'restaurants' && restaurantsLoading) && (
          <div className="text-center text-muted-foreground">
            Cargando restaurantes...
          </div>
        )}

        {(activeTab === 'dishes' && dishesLoading) && (
          <div className="text-center text-muted-foreground">
            Cargando platos...
          </div>
        )}
      </div>

      {/* Modals */}
      <LocationModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
      />

      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        activeTab={activeTab}
        // Restaurant filters
        cuisineFilters={cuisineFilters}
        onCuisineChange={setCuisineFilters}
        // Dish filters
        foodTypeFilters={foodTypeFilters}
        onFoodTypeChange={setFoodTypeFilters}
        // Common filters
        priceRanges={priceRanges}
        onPriceRangeChange={handlePriceRangeChange}
        minRating={minRating}
        onRatingChange={setMinRating}
        maxDistance={maxDistance}
        onDistanceChange={setMaxDistance}
        dietTypes={dietTypes}
        onDietTypeChange={setDietTypes}
      />

      {selectedDish && (
        <DishModal
          isOpen={!!selectedDish}
          dish={selectedDish}
          restaurantId={selectedDish.restaurant.id}
          onClose={() => setSelectedDish(null)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
