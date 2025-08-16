
import { useState, useEffect } from 'react';
import VirtualizedRestaurantGrid from './VirtualizedRestaurantGrid';
import VirtualizedDishesGrid from './VirtualizedDishesGrid';
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

  const handleLoginRequired = () => {
    // Handle login requirement
    console.log('Login required');
  };

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

        {/* Tabs with Virtualized Components */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dishes' | 'restaurants')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="dishes">
              Platos
            </TabsTrigger>
            <TabsTrigger value="restaurants">
              Restaurantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dishes">
            <VirtualizedDishesGrid
              searchQuery={searchQuery}
              userLat={userLocation?.lat}
              userLng={userLocation?.lng}
              selectedDietTypes={selectedDietTypes}
              selectedPriceRanges={selectedPriceRanges}
            />
          </TabsContent>

          <TabsContent value="restaurants">
            <VirtualizedRestaurantGrid
              searchQuery={searchQuery}
              userLat={userLocation?.lat}
              userLng={userLocation?.lng}
              cuisineTypeIds={selectedCuisineTypes}
              priceRanges={selectedPriceRanges}
              isHighRated={isHighRated}
              selectedEstablishmentTypes={selectedEstablishmentTypes}
              selectedDietTypes={selectedDietTypes}
              isOpenNow={isOpenNow}
              isBudgetFriendly={isBudgetFriendly}
              onLoginRequired={handleLoginRequired}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
