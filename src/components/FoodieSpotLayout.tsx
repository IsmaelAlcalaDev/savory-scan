import React, { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, User, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CuisineFilter from './CuisineFilter';
import FoodTypeFilter from './FoodTypeFilter';
import FiltersModal from './FiltersModal';
import DishesFiltersModal from './DishesFiltersModal';
import RestaurantCard from './RestaurantCard';
import AllDishCard from './AllDishCard';
import LocationModal from './LocationModal';
import BottomNavigation from './BottomNavigation';
import AccountModal from './AccountModal';
import MenuModal from './MenuModal';
import LanguageSelector from './LanguageSelector';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useDishes } from '@/hooks/useDishes';
import { useDistanceRanges } from '@/hooks/useDistanceRanges';
import { useRatingOptions } from '@/hooks/useRatingOptions';
import { useEstablishmentTypes } from '@/hooks/useEstablishmentTypes';
import { useServices } from '@/hooks/useServices';
import { usePriceRanges } from '@/hooks/usePriceRanges';
import { useTimeRanges } from '@/hooks/useTimeRanges';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useDietTypes } from '@/hooks/useDietTypes';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilters } from '@/contexts/FilterContext';
import { FilterStateIndicator, FilterStatusBadge } from '@/components/FilterStateIndicator';

const filterOptions = [
  { id: 'nearby', label: 'Cerca de mí', active: true },
  { id: 'open', label: 'Abierto', active: false },
  { id: 'economic', label: 'Económico', active: false },
  { id: 'top', label: 'Top', active: false },
];

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes' | 'account';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  console.log('FoodieSpotLayout: Rendering component with initialTab:', initialTab);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedPrepTimeRanges, setSelectedPrepTimeRanges] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['nearby']);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentLocationName, setCurrentLocationName] = useState('Selecciona ubicación');
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const { 
    filters, 
    validation, 
    updateFilter, 
    clearAllFilters,
    validateFilters 
  } = useFilters();

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
  } = useRestaurants({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    filters
  });

  const {
    dishes,
    loading: dishesLoading,
    error: dishesError,
  } = useDishes({
    searchQuery,
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    filters
  });

  // Determine active tab based on current route
  const getActiveTabFromRoute = (): 'restaurants' | 'dishes' | 'account' => {
    if (location.pathname === '/platos') return 'dishes';
    if (location.pathname === '/restaurantes' || location.pathname === '/') return 'restaurants';
    return 'restaurants';
  };

  const [activeBottomTab, setActiveBottomTab] = useState<'restaurants' | 'dishes' | 'account'>(getActiveTabFromRoute());

  // Update active tab when route changes
  useEffect(() => {
    const newTab = getActiveTabFromRoute();
    console.log('Route changed, updating active tab to:', newTab, 'from path:', location.pathname);
    setActiveBottomTab(newTab);
  }, [location.pathname]);

  const { distanceRanges } = useDistanceRanges();
  const { ratingOptions } = useRatingOptions();
  const { establishmentTypes } = useEstablishmentTypes();
  const { services } = useServices();
  const { priceRanges } = usePriceRanges();
  const { timeRanges } = useTimeRanges();
  const { cuisineTypes } = useCuisineTypes();
  const { dietTypes } = useDietTypes();

  // Cargar configuración de branding desde la BD
  const { data: appSettings } = useAppSettings();
  const appName = appSettings?.appName ?? 'FoodieSpot';
  const appLogoUrl = appSettings?.logoUrl ?? 'https://w7.pngwing.com/pngs/256/867/png-transparent-zomato-logo-thumbnail.png';

  // Load saved location or request GPS
  useEffect(() => {
    const loadSavedLocation = () => {
      try {
        const savedLocation = localStorage.getItem('selectedLocation');
        if (savedLocation) {
          const locationData = JSON.parse(savedLocation);
          console.log('Loading saved location:', locationData);
          
          if (locationData.latitude && locationData.longitude) {
            setUserLocation({
              lat: locationData.latitude,
              lng: locationData.longitude
            });
            
            // Determine location name
            if (locationData.address) {
              setCurrentLocationName(locationData.address);
            } else if (locationData.name && locationData.parent) {
              const locationDisplay = `${locationData.name}, ${locationData.parent.split(',')[0]}`;
              setCurrentLocationName(locationDisplay);
            } else if (locationData.name) {
              setCurrentLocationName(locationData.name);
            } else {
              setCurrentLocationName('Ubicación guardada');
            }
            return true;
          }
        }
      } catch (error) {
        console.error('Error loading saved location:', error);
      }
      return false;
    };
    
    const requestGPSLocation = async () => {
      if (!('geolocation' in navigator)) {
        console.log('Geolocation not supported');
        return;
      }

      setIsLoadingLocation(true);
      setCurrentLocationName('Detectando ubicación...');
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });

        const { latitude, longitude } = position.coords;
        console.log('GPS location obtained:', { latitude, longitude });
        
        setUserLocation({
          lat: latitude,
          lng: longitude
        });
        
        setCurrentLocationName('Ubicación detectada');
        
        // Save to localStorage
        localStorage.setItem('selectedLocation', JSON.stringify({
          latitude,
          longitude,
          address: 'Ubicación detectada'
        }));
        
      } catch (error: any) {
        console.error('GPS Error:', error);
        setCurrentLocationName('Selecciona ubicación');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    // Try loading saved location first
    const hasSavedLocation = loadSavedLocation();
    
    // If no saved location, request GPS
    if (!hasSavedLocation) {
      requestGPSLocation();
    }
  }, []);

  const handleDistanceChange = (distances: number[]) => {
    // Convert distance IDs to distance strings based on your distance ranges
    const distanceMap: Record<number, string> = {
      1: 'muy_cerca',
      2: 'caminando', 
      3: 'bicicleta',
      4: 'transporte',
      5: 'coche'
    };
    
    const selectedDistance = distances.length > 0 ? distanceMap[distances[0]] || 'sin_limite' : 'sin_limite';
    updateFilter('distance', selectedDistance);
  };

  const handleRatingChange = (ratings: number[]) => {
    const minRating = ratings.length > 0 ? Math.max(...ratings.map(r => r * 1.0)) : 0;
    updateFilter('rating', minRating);
  };

  const handleEstablishmentChange = (establishments: number[]) => {
    updateFilter('venueTypes', establishments);
  };

  const handleServiceChange = (services: number[]) => {
    updateFilter('services', services);
  };

  const handlePriceRangeChange = (priceRanges: string[]) => {
    const budgetMap: Record<string, number> = {
      'budget': 1,
      'mid': 2, 
      'premium': 3,
      'luxury': 4
    };
    const budgetLevels = priceRanges.map(range => budgetMap[range]).filter(Boolean);
    updateFilter('budget', budgetLevels);
  };

  const handleTimeRangeChange = (timeRanges: number[]) => {
    // Map time range IDs to time slots
    const timeMap: Record<number, string> = {
      1: 'desayuno',
      2: 'almuerzo',
      3: 'merienda', 
      4: 'cena',
      5: 'noche'
    };
    
    const selectedTime = timeRanges.length > 0 ? timeMap[timeRanges[0]] : null;
    updateFilter('timeSlot', selectedTime);
  };

  const handleDietTypeChange = (dietTypes: string[]) => {
    updateFilter('dietaryRestrictions', dietTypes);
  };

  // Quick filter handlers
  const handleQuickFilterChange = (filterName: keyof typeof filters.quickFilters) => {
    updateFilter('quickFilters', {
      ...filters.quickFilters,
      [filterName]: !filters.quickFilters[filterName]
    });
  };

  // Count active filters
  const hasActiveFilters = filters.budget.length > 0 || 
    filters.rating > 0 || 
    filters.dietaryRestrictions.length > 0 ||
    filters.venueTypes.length > 0 ||
    filters.services.length > 0 ||
    Object.values(filters.quickFilters).some(Boolean);

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleLocationSelect = (location: { type: string; data?: any }) => {
    console.log('FoodieSpotLayout: Manual location selected:', location);
    if (location.type === 'gps') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      if (location.data.name && location.data.parent) {
        const locationDisplay = `${location.data.name}, ${location.data.parent.split(',')[0]}`;
        setCurrentLocationName(locationDisplay);
      } else if (location.data.address) {
        setCurrentLocationName(location.data.address);
      } else {
        setCurrentLocationName('Ubicación detectada');
      }
    } else if (location.type === 'city') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      setCurrentLocationName(location.data.name);
    } else if (location.type === 'suggestion') {
      setUserLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
      const locationDisplay = location.data.parent 
        ? `${location.data.name}, ${location.data.parent.split(',')[0]}`
        : location.data.name;
      setCurrentLocationName(locationDisplay);
    } else if (location.type === 'manual') {
      setCurrentLocationName(location.data.query);
    }
    console.log('Updated location name:', currentLocationName);
  };

  const clearAllFiltersLocal = () => {
    setSelectedCuisines([]);
    setSelectedDistances([]);
    setSelectedRatings([]);
    setSelectedEstablishments([]);
    setSelectedServices([]);
    setSelectedPriceRanges([]);
    setSelectedTimeRanges([]);
    setSelectedDietTypes([]);
    setActiveFilters([]);
    clearAllFilters();
  };

  const removeFilter = (filterType: string, value: any) => {
    switch (filterType) {
      case 'cuisine':
        setSelectedCuisines(prev => prev.filter(id => id !== value));
        break;
      case 'distance':
        setSelectedDistances(prev => prev.filter(id => id !== value));
        break;
      case 'rating':
        setSelectedRatings(prev => prev.filter(id => id !== value));
        break;
      case 'establishment':
        setSelectedEstablishments(prev => prev.filter(id => id !== value));
        break;
      case 'service':
        setSelectedServices(prev => prev.filter(id => id !== value));
        break;
      case 'price':
        setSelectedPriceRanges(prev => prev.filter(range => range !== value));
        break;
      case 'time':
        setSelectedTimeRanges(prev => prev.filter(id => id !== value));
        break;
      case 'diet':
        setSelectedDietTypes(prev => prev.filter(slug => slug !== value));
        break;
      case 'quick':
        setActiveFilters(prev => prev.filter(id => id !== value));
        break;
    }
  };

  const getActiveFiltersDisplay = () => {
    const filters = [];

    // Quick filters (except 'nearby' as it's default)
    activeFilters.forEach(filterId => {
      if (filterId !== 'nearby') {
        const quickFilter = filterOptions.find(f => f.id === filterId);
        if (quickFilter) {
          filters.push({
            type: 'quick',
            value: filterId,
            label: quickFilter.label
          });
        }
      }
    });

    // Cuisines
    selectedCuisines.forEach(id => {
      const cuisine = cuisineTypes?.find(c => c.id === id);
      if (cuisine) {
        filters.push({
          type: 'cuisine',
          value: id,
          label: cuisine.name
        });
      }
    });

    // Distance
    selectedDistances.forEach(id => {
      const distance = distanceRanges?.find(d => d.id === id);
      if (distance) {
        filters.push({
          type: 'distance',
          value: id,
          label: distance.display_text
        });
      }
    });

    // Rating
    selectedRatings.forEach(id => {
      const rating = ratingOptions?.find(r => r.id === id);
      if (rating) {
        filters.push({
          type: 'rating',
          value: id,
          label: rating.display_text
        });
      }
    });

    // Establishments
    selectedEstablishments.forEach(id => {
      const establishment = establishmentTypes?.find(e => e.id === id);
      if (establishment) {
        filters.push({
          type: 'establishment',
          value: id,
          label: establishment.name
        });
      }
    });

    // Services
    selectedServices.forEach(id => {
      const service = services?.find(s => s.id === id);
      if (service) {
        filters.push({
          type: 'service',
          value: id,
          label: service.name
        });
      }
    });

    // Price ranges
    selectedPriceRanges.forEach(value => {
      const priceRange = priceRanges?.find(p => p.value === value);
      if (priceRange) {
        filters.push({
          type: 'price',
          value: value,
          label: priceRange.display_text
        });
      }
    });

    // Time ranges
    selectedTimeRanges.forEach(id => {
      const timeRange = timeRanges?.find(t => t.id === id);
      if (timeRange) {
        filters.push({
          type: 'time',
          value: id,
          label: timeRange.display_text
        });
      }
    });

    // Diet types
    selectedDietTypes.forEach(slug => {
      const dietType = dietTypes?.find(d => d.slug === slug);
      if (dietType) {
        filters.push({
          type: 'diet',
          value: slug,
          label: dietType.name
        });
      }
    });

    return filters;
  };

  const handleBottomTabChange = (tab: 'restaurants' | 'dishes' | 'account') => {
    console.log('Bottom tab change requested to:', tab);
    
    if (tab === 'account') {
      setAccountModalOpen(true);
      return;
    }
    
    // Navigate to the appropriate route without triggering conflicts
    if (tab === 'dishes') {
      navigate('/platos', { replace: true });
    } else if (tab === 'restaurants') {
      navigate('/restaurantes', { replace: true });
    }
  };

  const handleLoginRequired = () => {
    setAccountModalOpen(true);
  };

  const handleLogoClick = () => {
    console.log('Logo clicked, navigating to /restaurantes');
    navigate('/restaurantes');
  };

  const TagButton = ({ 
    children, 
    isSelected, 
    onClick
  }: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        "h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full !bg-transparent !shadow-none !backdrop-blur-none flex items-center whitespace-nowrap flex-shrink-0",
        isSelected 
          ? "!bg-primary text-primary-foreground hover:!bg-primary/90 border-primary" 
          : "!bg-transparent hover:!bg-muted/50 text-muted-foreground hover:text-foreground border-border"
      )}
    >
      <span className="flex items-center">{children}</span>
    </button>
  );

  const FilterTag = ({ 
    children, 
    onRemove
  }: {
    children: React.ReactNode;
    onRemove: () => void;
  }) => (
    <button
      onClick={onRemove}
      className="h-7 px-2.5 text-xs font-medium transition-all duration-200 border rounded-full bg-transparent text-primary border-primary hover:bg-primary/5 flex items-center whitespace-nowrap flex-shrink-0"
    >
      <span className="flex items-center">{children}</span>
      <X className="ml-1 h-3 w-3 flex-shrink-0" />
    </button>
  );

  const renderContent = () => {
    if (activeBottomTab === 'dishes') {
      const activeFiltersDisplay = getActiveFiltersDisplay();

      // Dynamic title for dishes
      const getDynamicTitle = () => {
        if (userLocation) {
          return `${dishes.length} platos cerca de ti`;
        }
        
        return `${dishes.length} platos`;
      };

      return (
        <>
          {/* Results Header with Dynamic Title */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {dishesLoading ? 'Cargando platos...' : getDynamicTitle()}
              </h2>
              {dishesError && (
                <p className="text-sm text-destructive mt-1">Error: {dishesError}</p>
              )}
            </div>
          </div>

          {/* Filter Badges */}
          <div className="flex items-center gap-4 mb-6 pt-1 pb-1">
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-14 pr-4">
                {filterOptions.map((filter) => (
                  <TagButton
                    key={filter.id}
                    isSelected={activeFilters.includes(filter.id)}
                    onClick={() => handleFilterToggle(filter.id)}
                  >
                    {filter.label}
                  </TagButton>
                ))}
              </div>
              {/* Botón de filtros fijo */}
              <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 bg-white pr-2">
                <DishesFiltersModal
                  selectedDistances={selectedDistances}
                  onDistanceChange={setSelectedDistances}
                  selectedPriceRanges={selectedPriceRanges}
                  onPriceRangeChange={setSelectedPriceRanges}
                  selectedDietTypes={selectedDietTypes}
                  onDietTypeChange={setSelectedDietTypes}
                  selectedSpiceLevels={selectedSpiceLevels}
                  onSpiceLevelChange={setSelectedSpiceLevels}
                  selectedPrepTimeRanges={selectedPrepTimeRanges}
                  onPrepTimeRangeChange={setSelectedPrepTimeRanges}
                />
              </div>
              {/* Fade gradient for overflow */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersDisplay.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-6">
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-1 pr-4">
                    {activeFiltersDisplay.map((filter, index) => (
                      <FilterTag
                        key={`${filter.type}-${filter.value}-${index}`}
                        onRemove={() => removeFilter(filter.type, filter.value)}
                      >
                        {filter.label}
                      </FilterTag>
                    ))}
                  </div>
                  {/* Fade gradient for overflow */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                </div>
                <button 
                  onClick={clearAllFiltersLocal}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          {/* Dishes Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {dishesLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))
            ) : dishesError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Error al cargar platos: {dishesError}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Revisa la consola para más detalles
                </p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No se encontraron platos</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Intenta cambiar los filtros de búsqueda
                </p>
              </div>
            ) : (
              dishes.map((dish) => (
                <AllDishCard
                  key={dish.id}
                  id={dish.id}
                  name={dish.name}
                  description={dish.description}
                  basePrice={dish.base_price}
                  imageUrl={dish.image_url}
                  categoryName={dish.category_name}
                  restaurantName={dish.restaurant_name}
                  restaurantSlug={dish.restaurant_slug}
                  restaurantRating={dish.restaurant_google_rating}
                  distance={dish.distance_km}
                  formattedPrice={dish.formatted_price}
                />
              ))
            )}
          </div>
        </>
      );
    }

    const activeFiltersDisplay = getActiveFiltersDisplay();

    // Dynamic title based on location
    const getDynamicTitle = () => {
      if (userLocation) {
        return `${restaurants.length} restaurantes cerca de ti`;
      }
      
      return `${restaurants.length} restaurantes`;
    };

    // Default restaurants content (siempre mostrar cuando no sea 'dishes')
    return (
      <>
        {/* Results Header with Dynamic Title */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {restaurantsLoading ? 'Cargando restaurantes...' : getDynamicTitle()}
            </h2>
            {restaurantsError && (
              <p className="text-sm text-destructive mt-1">Error: {restaurantsError}</p>
            )}
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-4 mb-6 pt-1 pb-1">
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-14 pr-4">
              {filterOptions.map((filter) => (
                <TagButton
                  key={filter.id}
                  isSelected={activeFilters.includes(filter.id)}
                  onClick={() => handleFilterToggle(filter.id)}
                >
                  {filter.label}
                </TagButton>
              ))}
            </div>
            {/* Botón de filtros fijo */}
            <div className="absolute left-0 top-0 bottom-0 flex items-center z-20 bg-white pr-2">
              <FiltersModal
                selectedDistances={selectedDistances}
                onDistanceChange={setSelectedDistances}
                selectedRatings={selectedRatings}
                onRatingChange={setSelectedRatings}
                selectedEstablishments={selectedEstablishments}
                onEstablishmentChange={setSelectedEstablishments}
                selectedServices={selectedServices}
                onServiceChange={setSelectedServices}
                selectedPriceRanges={selectedPriceRanges}
                onPriceRangeChange={setSelectedPriceRanges}
                selectedTimeRanges={selectedTimeRanges}
                onTimeRangeChange={setSelectedTimeRanges}
                selectedDietTypes={selectedDietTypes}
                onDietTypeChange={setSelectedDietTypes}
              />
            </div>
            {/* Fade gradient for overflow */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersDisplay.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-6">
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2 overflow-x-auto overflow-y-visible scrollbar-hide pl-1 pr-4">
                  {activeFiltersDisplay.map((filter, index) => (
                    <FilterTag
                      key={`${filter.type}-${filter.value}-${index}`}
                      onRemove={() => removeFilter(filter.type, filter.value)}
                    >
                      {filter.label}
                    </FilterTag>
                  ))}
                </div>
                {/* Fade gradient for overflow */}
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
              </div>
              <button 
                onClick={clearAllFiltersLocal}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop, 4 cols large screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {restaurantsLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))
          ) : restaurantsError ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Error al cargar restaurantes: {restaurantsError}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Revisa la consola para más detalles
              </p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No se encontraron restaurantes</p>
              <p className="text-sm text-muted-foreground mt-2">
                Intenta cambiar los filtros de búsqueda
              </p>
            </div>
          ) : (
            restaurants.map((restaurant) => (
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
                establishmentType={restaurant.establishment_type}
                services={restaurant.services}
                favoritesCount={restaurant.favorites_count}
                coverImageUrl={restaurant.cover_image_url}
                logoUrl={restaurant.logo_url}
                onLoginRequired={handleLoginRequired}
              />
            ))
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white -mx-[7.5%] px-[7.5%]">
          <div className="flex items-center justify-between py-3 px-4">
            {/* Left Section: Logo */}
            <div className="flex items-center flex-shrink-0 relative">
              <button onClick={handleLogoClick} className="flex items-center">
                <img 
                  src={appLogoUrl}
                  alt={`${appName} Logo`} 
                  className="w-24 h-24 bg-transparent object-contain absolute top-1/2 left-0 transform -translate-y-1/2 z-10 cursor-pointer"
                />
              </button>
              {/* Spacer to maintain layout */}
              <div className="w-24 h-8" />
            </div>

            {/* Center Section: Location and Search */}
            <div className="flex items-center gap-4 flex-1 justify-center max-w-2xl mx-8">
              {/* Location Section */}
              <div className="flex justify-start">
                <Button
                  variant="ghost"
                  onClick={() => setLocationModalOpen(true)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary hover:bg-transparent whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="max-w-40 truncate">
                    {isLoadingLocation ? 'Detectando...' : currentLocationName}
                  </span>
                </Button>
              </div>

              {/* Search Section */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors z-10 ${
                    isSearchFocused ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <Input
                    type="text"
                    placeholder="Buscar restaurantes, platos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-10 pr-4 h-10 text-base bg-background/50 border border-muted-foreground backdrop-blur-sm rounded-full focus:border-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:shadow-none focus-visible:shadow-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Section: Language & Menu */}
            <div className="flex items-center gap-12 flex-shrink-0">
              <LanguageSelector />
              <button 
                className="p-0 border-0 bg-transparent hover:bg-transparent focus:bg-transparent text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setMenuModalOpen(true)}
              >
                <Menu className="h-8 w-8" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Tipos de Cocina / Tipos de Comida */}
          <div className="px-4 pb-2 pt-2">
            {activeBottomTab === 'dishes' ? (
              <FoodTypeFilter 
                selectedFoodTypes={selectedFoodTypes}
                onFoodTypeChange={setSelectedFoodTypes}
              />
            ) : (
              <CuisineFilter 
                selectedCuisines={selectedCuisines}
                onCuisineChange={setSelectedCuisines}
              />
            )}
          </div>
        </header>

        {/* Filter Status and Conflicts */}
        {(validation.hasConflicts || hasActiveFilters) && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <FilterStatusBadge 
                hasActiveFilters={hasActiveFilters}
                conflictCount={validation.conflicts.length}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAllFiltersLocal}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <FilterStateIndicator validation={validation} />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              {/* Sidebar filters could be added here if needed */}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <div className="lg:hidden">
          <FiltersModal
            selectedDistances={selectedDistances}
            onDistanceChange={setSelectedDistances}
            selectedRatings={selectedRatings}
            onRatingChange={setSelectedRatings}
            selectedEstablishments={selectedEstablishments}
            onEstablishmentChange={setSelectedEstablishments}
            selectedServices={selectedServices}
            onServiceChange={setSelectedServices}
            selectedPriceRanges={selectedPriceRanges}
            onPriceRangeChange={setSelectedPriceRanges}
            selectedTimeRanges={selectedTimeRanges}
            onTimeRangeChange={setSelectedTimeRanges}
            selectedDietTypes={selectedDietTypes}
            onDietTypeChange={setSelectedDietTypes}
          />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation 
          activeTab={activeBottomTab}
          onTabChange={handleBottomTabChange}
        />

        {/* Account Modal */}
        <AccountModal
          open={accountModalOpen}
          onOpenChange={setAccountModalOpen}
        />

        {/* Menu Modal */}
        <MenuModal
          open={menuModalOpen}
          onOpenChange={setMenuModalOpen}
        />

        {/* Location Modal */}
        <LocationModal
          open={locationModalOpen}
          onOpenChange={setLocationModalOpen}
          onLocationSelect={handleLocationSelect}
        />
        
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
}
