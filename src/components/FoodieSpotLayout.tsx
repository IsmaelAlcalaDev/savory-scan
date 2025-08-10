
import { useState } from 'react';
import { Plus } from 'lucide-react';
import SearchBar from './SearchBar';
import FiltersSidebar from './FiltersSidebar';
import RestaurantCard from './RestaurantCard';
import BottomNavigation from './BottomNavigation';
import AccountModal from './AccountModal';
import AuthModal from './AuthModal';
import ViewModeToggle from './ViewModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurants } from '@/hooks/useRestaurants';

export default function FoodieSpotLayout() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'dishes' | 'account'>('restaurants');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter states
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<number[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);

  const { user } = useAuth();
  const { restaurants, loading, error } = useRestaurants({
    searchQuery,
    priceRanges: selectedPriceRanges.length > 0 ? selectedPriceRanges as ('€' | '€€' | '€€€' | '€€€€')[] : undefined,
    minRating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : undefined
  });

  const handleAccountClick = () => {
    if (user) {
      setShowAccountModal(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleTabChange = (tab: 'restaurants' | 'dishes' | 'account') => {
    if (tab === 'account') {
      handleAccountClick();
    } else {
      setActiveTab(tab);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleLocationSelect = () => {
    // TODO: Implement location selection
    console.log('Location selection not implemented yet');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[4/3] rounded-lg mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error al cargar los restaurantes</p>
        </div>
      );
    }

    if (restaurants.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron restaurantes</p>
        </div>
      );
    }

    return (
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        : "space-y-4"
      }>
        {restaurants.map((restaurant) => (
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
            cuisineTypes={restaurant.cuisine_types}
            establishmentType={restaurant.establishment_type}
            favoritesCount={restaurant.favorites_count}
            coverImageUrl={restaurant.cover_image_url}
            logoUrl={restaurant.logo_url}
            className={viewMode === 'list' ? 'flex gap-4' : ''}
            onAuthRequired={() => setShowAuthModal(true)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">FoodieSpot</h1>
            </div>
            <div className="flex items-center gap-2">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FiltersSidebar
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
          )}
          
          <div className="flex-1 space-y-6">
            <SearchBar 
              onSearchChange={handleSearchChange}
              onLocationSelect={handleLocationSelect}
            />
            {activeTab === 'restaurants' && renderContent()}
            {activeTab === 'dishes' && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Vista de platos próximamente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />

      <AccountModal 
        open={showAccountModal} 
        onOpenChange={setShowAccountModal} 
      />

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal} 
      />
    </div>
  );
}
