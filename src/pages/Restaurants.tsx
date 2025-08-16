import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { QuickActionTags } from '@/components/QuickActionTags';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterTags } from '@/components/FilterTags';
import { UnifiedFiltersModal } from '@/components/UnifiedFiltersModal';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { Loader2 } from 'lucide-react';

interface RestaurantFilters {
  cuisineTypeIds: number[];
  priceRanges: string[];
  establishmentTypeIds: number[];
  dietTypeIds: number[];
  isHighRated: boolean;
  isOpenNow: boolean;
  isBudgetFriendly: boolean;
  maxDistance: number;
}

const Restaurants = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [filters, setFilters] = useState<RestaurantFilters>({
    cuisineTypeIds: [],
    priceRanges: [],
    establishmentTypeIds: [],
    dietTypeIds: [],
    isHighRated: false,
    isOpenNow: false,
    isBudgetFriendly: false,
    maxDistance: 50,
  });

  const { location, loading: locationLoading } = useNearestLocation();

  const {
    restaurants,
    loading: restaurantsLoading,
    error
  } = useRestaurants({
    searchQuery,
    userLat: location?.latitude,
    userLng: location?.longitude,
    maxDistance: filters.maxDistance,
    cuisineTypeIds: filters.cuisineTypeIds,
    priceRanges: filters.priceRanges,
    isHighRated: filters.isHighRated,
    selectedEstablishmentTypes: filters.establishmentTypeIds,
    selectedDietTypes: filters.dietTypeIds,
    isOpenNow: filters.isOpenNow,
    isBudgetFriendly: filters.isBudgetFriendly,
  });

  useEffect(() => {
    const handleUrlParams = () => {
      const cuisineTypeIds = searchParams.get('cuisineTypeIds');
      const priceRanges = searchParams.get('priceRanges');
      const establishmentTypeIds = searchParams.get('establishmentTypeIds');
      const dietTypeIds = searchParams.get('dietTypeIds');
      const maxDistance = searchParams.get('maxDistance');
      const isHighRated = searchParams.get('isHighRated');
      const isOpenNow = searchParams.get('isOpenNow');
      const isBudgetFriendly = searchParams.get('isBudgetFriendly');

      if (cuisineTypeIds) {
        setFilters(prev => ({
          ...prev,
          cuisineTypeIds: cuisineTypeIds.split(',').map(Number)
        }));
      }

      if (priceRanges) {
        setFilters(prev => ({
          ...prev,
          priceRanges: priceRanges.split(',')
        }));
      }

      if (establishmentTypeIds) {
        setFilters(prev => ({
          ...prev,
          establishmentTypeIds: establishmentTypeIds.split(',').map(Number)
        }));
      }

      if (dietTypeIds) {
        setFilters(prev => ({
          ...prev,
          dietTypeIds: dietTypeIds.split(',').map(Number)
        }));
      }

      if (maxDistance) {
        setFilters(prev => ({
          ...prev,
          maxDistance: parseInt(maxDistance, 10)
        }));
      }

      if (isHighRated) {
        setFilters(prev => ({
          ...prev,
          isHighRated: isHighRated === 'true'
        }));
      }

      if (isOpenNow) {
        setFilters(prev => ({
          ...prev,
          isOpenNow: isOpenNow === 'true'
        }));
      }

      if (isBudgetFriendly) {
        setFilters(prev => ({
          ...prev,
          isBudgetFriendly: isBudgetFriendly === 'true'
        }));
      }
    };

    handleUrlParams();
  }, [searchParams]);

  const handleFiltersApply = (newFilters: any) => {
    setFilters(prev => ({
      ...prev,
      cuisineTypeIds: newFilters.cuisineTypeIds || [],
      priceRanges: newFilters.priceRanges || [],
      establishmentTypeIds: newFilters.establishmentTypeIds || [],
      dietTypeIds: newFilters.dietTypeIds || [],
      maxDistance: newFilters.maxDistance || 50,
    }));
    setIsFiltersOpen(false);
  };

  const handleQuickFilterToggle = (filterType: 'isOpenNow' | 'isHighRated' | 'isBudgetFriendly') => {
    setFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      cuisineTypeIds: [],
      priceRanges: [],
      establishmentTypeIds: [],
      dietTypeIds: [],
      isHighRated: false,
      isOpenNow: false,
      isBudgetFriendly: false,
      maxDistance: 50,
    });
    setSearchQuery('');
  };

  const loading = locationLoading || restaurantsLoading;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error al cargar restaurantes</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onFiltersClick={() => setIsFiltersOpen(true)}
          placeholder="Buscar restaurantes..."
        />
        
        <QuickActionTags
          onOpenNowToggle={() => handleQuickFilterToggle('isOpenNow')}
          onHighRatedToggle={() => handleQuickFilterToggle('isHighRated')}
          onBudgetFriendlyToggle={() => handleQuickFilterToggle('isBudgetFriendly')}
          isOpenNow={filters.isOpenNow}
          isHighRated={filters.isHighRated}
          isBudgetFriendly={filters.isBudgetFriendly}
        />

        <FilterTags
          filters={{
            cuisineTypeIds: filters.cuisineTypeIds,
            priceRanges: filters.priceRanges,
            establishmentTypeIds: filters.establishmentTypeIds,
            dietTypeIds: filters.dietTypeIds,
            maxDistance: filters.maxDistance,
          }}
          onClearAll={clearAllFilters}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Cargando...' : `${restaurants.length} restaurantes encontrados`}
        </p>
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No se encontraron restaurantes</p>
          <p className="text-sm text-muted-foreground">
            Intenta cambiar los filtros o buscar en una zona diferente
          </p>
        </div>
      )}

      <UnifiedFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={handleFiltersApply}
        initialFilters={{
          cuisineTypeIds: filters.cuisineTypeIds,
          priceRanges: filters.priceRanges,
          establishmentTypeIds: filters.establishmentTypeIds,
          dietTypeIds: filters.dietTypeIds,
          maxDistance: filters.maxDistance,
        }}
      />
    </div>
  );
};

export default Restaurants;
