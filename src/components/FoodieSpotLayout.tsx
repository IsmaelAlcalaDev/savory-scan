
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CuisineTypeSelector } from './CuisineFilter';
import { PriceRangeSelector } from './PriceFilter';
import { EstablishmentTypeSelector } from './EstablishmentTypeFilter';
import RestaurantsGrid from './PaginatedRestaurantsGrid';
import DishesGrid from './DishesGrid';
import PaginatedRestaurantsTab from './PaginatedRestaurantsTab';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { DietTypeSelector } from './DietFilter';
import RpcRestaurantsGrid from './RpcRestaurantsGrid';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface FoodieSpotLayoutProps {
  initialTab?: "home" | "restaurants" | "dishes";
}

export default function FoodieSpotLayout({ initialTab = "home" }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [isHighRated, setIsHighRated] = useState(false);
  const [selectedCuisineTypes, setSelectedCuisineTypes] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<number[]>([]);
  const [selectedDietTypes, setSelectedDietTypes] = useState<number[]>([]);
  const [minDietPercentages, setMinDietPercentages] = useState<{ [key: string]: number }>({});
  const { userLocation, updatePreferences } = useUserPreferences();
  const { flags } = useFeatureFlags();

  useEffect(() => {
    // Update user preferences when location changes
    if (userLocation) {
      updatePreferences({ userLocation });
    }
  }, [userLocation, updatePreferences]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDistanceChange = (value: number[]) => {
    setMaxDistance(value[0]);
  };

  const handleCuisineTypeChange = (ids: number[]) => {
    setSelectedCuisineTypes(ids);
  };

  const handlePriceRangeChange = (values: string[]) => {
    setSelectedPriceRanges(values);
  };

  const handleEstablishmentTypeChange = (ids: number[]) => {
    setSelectedEstablishmentTypes(ids);
  };

  const handleDietTypeChange = (ids: number[]) => {
    setSelectedDietTypes(ids);
  };

  const handleMinDietPercentagesChange = (percentages: { [key: string]: number }) => {
    setMinDietPercentages(percentages);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Encuentra tu próximo lugar favorito</h2>
              <Input
                type="text"
                placeholder="Buscar restaurantes o platos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="mb-4"
              />

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Filtrar por distancia</h3>
                <p className="text-sm text-muted-foreground">
                  Mostrar restaurantes a menos de {maxDistance} km
                </p>
                <Slider
                  defaultValue={[maxDistance]}
                  max={50}
                  step={1}
                  onValueChange={handleDistanceChange}
                  aria-label="Distancia máxima"
                  className="mb-4"
                />
              </div>

              <CuisineTypeSelector onChange={handleCuisineTypeChange} />
              <PriceRangeSelector onChange={handlePriceRangeChange} />
              <EstablishmentTypeSelector onChange={handleEstablishmentTypeChange} />
              <DietTypeSelector onChange={handleDietTypeChange} onMinPercentagesChange={handleMinDietPercentagesChange} />

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isHighRated}
                  onChange={(e) => setIsHighRated(e.target.checked)}
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Mostrar solo restaurantes mejor valorados (4.5+)
                </span>
              </label>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Restaurantes</h2>
              </div>
              
              {flags?.FF_HOME_RPC_FEED ? (
                <RpcRestaurantsGrid
                  searchQuery={searchQuery}
                  cuisineTypeIds={selectedCuisineTypes}
                  priceRanges={selectedPriceRanges}
                  isHighRated={isHighRated}
                  selectedEstablishmentTypes={selectedEstablishmentTypes}
                  selectedDietTypes={selectedDietTypes}
                  minDietPercentages={minDietPercentages}
                  maxDistance={maxDistance}
                />
              ) : (
                <RestaurantsGrid
                  searchQuery={searchQuery}
                  cuisineTypeIds={selectedCuisineTypes}
                  priceRanges={selectedPriceRanges}
                  isHighRated={isHighRated}
                  selectedEstablishmentTypes={selectedEstablishmentTypes}
                  selectedDietTypes={selectedDietTypes}
                  minDietPercentages={minDietPercentages}
                  maxDistance={maxDistance}
                />
              )}
            </div>
          </div>
        );

      case "restaurants":
        return (
          <div>
            {flags?.FF_HOME_RPC_FEED ? (
              <RpcRestaurantsGrid
                searchQuery={searchQuery}
                cuisineTypeIds={selectedCuisineTypes}
                priceRanges={selectedPriceRanges}
                isHighRated={isHighRated}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietTypes={selectedDietTypes}
                minDietPercentages={minDietPercentages}
                maxDistance={maxDistance}
              />
            ) : (
              <PaginatedRestaurantsTab
                searchQuery={searchQuery}
                cuisineTypeIds={selectedCuisineTypes}
                priceRanges={selectedPriceRanges}
                isHighRated={isHighRated}
                selectedEstablishmentTypes={selectedEstablishmentTypes}
                selectedDietTypes={selectedDietTypes}
                maxDistance={maxDistance}
              />
            )}
          </div>
        );

      case "dishes":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Buscar Platos</h2>
              <Input
                type="text"
                placeholder="Buscar platos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="mb-4"
              />
            </div>
            <DishesGrid />
          </div>
        );

      default:
        return <div>Contenido no encontrado</div>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue={activeTab} className="w-full space-y-4" onValueChange={(value) => setActiveTab(value as "home" | "restaurants" | "dishes")}>
        <TabsList>
          <TabsTrigger value="home">Inicio</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
          <TabsTrigger value="dishes">Platos</TabsTrigger>
        </TabsList>
        <TabsContent value="home">
          {renderTabContent()}
        </TabsContent>
        <TabsContent value="restaurants">
          {renderTabContent()}
        </TabsContent>
        <TabsContent value="dishes">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
