
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SearchBar from '@/components/SearchBar';
import FiltersModal from '@/components/FiltersModal';
import CuisineFilter from '@/components/CuisineFilter';
import FoodTypeFilter from '@/components/FoodTypeFilter';
import DishesFiltersModal from '@/components/DishesFiltersModal';

interface FoodieSpotLayoutProps {
  children: React.ReactNode;
}

export default function FoodieSpotLayout({ children }: FoodieSpotLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.pathname === '/platos' ? 'dishes' : 'restaurants';
  const [activeBottomTab, setActiveBottomTab] = useState<"restaurants" | "dishes">(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Restaurant Filters
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedEstablishmentTypes, setSelectedEstablishmentTypes] = useState<string[]>([]);

  // Dishes Filters
  const [selectedDietTypes, setSelectedDietTypes] = useState<string[]>([]);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<number[]>([]);
  const [selectedPrepTimeRanges, setSelectedPrepTimeRanges] = useState<number[]>([]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState<number[]>([]);

  const handleSearch = (query: string, location?: string) => {
    setSearchTerm(query);
    // You can add search logic here
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header with Search Bar */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="px-4 py-4">
              <SearchBar 
                onSearch={handleSearch}
                placeholder={activeBottomTab === 'dishes' ? "Buscar platos..." : "Buscar restaurantes..."}
              />
            </div>
          </div>

          {/* Filtros y botón de filtros con más espacio */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200/30">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between gap-4">
                {/* Filtros rápidos - carrusel de tipos */}
                <div className="flex-1 min-w-0">
                  {activeBottomTab === 'restaurants' ? (
                    <CuisineFilter
                      selectedCuisines={selectedCuisines}
                      onCuisineChange={setSelectedCuisines}
                    />
                  ) : (
                    <FoodTypeFilter
                      selectedFoodTypes={selectedFoodTypes}
                      onFoodTypeChange={setSelectedFoodTypes}
                    />
                  )}
                </div>

                {/* Botón de filtros */}
                <div className="flex-shrink-0">
                  {activeBottomTab === 'restaurants' ? (
                    <FiltersModal
                      selectedDistances={selectedDistances}
                      onDistanceChange={setSelectedDistances}
                      selectedPriceRanges={selectedPriceRanges}
                      onPriceRangeChange={setSelectedPriceRanges}
                      selectedRatings={selectedRatings}
                      onRatingChange={setSelectedRatings}
                      selectedEstablishmentTypes={selectedEstablishmentTypes}
                      onEstablishmentTypeChange={setSelectedEstablishmentTypes}
                    />
                  ) : (
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
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200/50">
        <div className="px-4 py-2">
          <Tabs value={activeBottomTab} onValueChange={(value) => {
            setActiveBottomTab(value as "restaurants" | "dishes");
            const url = value === 'restaurants' ? '/' : '/platos';
            navigate(url);
          }}>
            <TabsList className="w-full flex items-center justify-center rounded-full bg-secondary">
              <TabsTrigger value="restaurants" className="w-1/2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Restaurantes</TabsTrigger>
              <TabsTrigger value="dishes" className="w-1/2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Platos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
