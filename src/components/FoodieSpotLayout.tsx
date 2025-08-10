import { useState } from 'react';
import { cn } from '@/lib/utils';
import BottomNavigation from './BottomNavigation';
import DistanceFilter from './DistanceFilter';
import CuisineFilter from './CuisineFilter';
import RatingFilter from './RatingFilter';
import VegModeToggle from './VegModeToggle';
import LocationInfo from './LocationInfo';

interface FoodieSpotLayoutProps {
  children: React.ReactNode;
}

export default function FoodieSpotLayout({ children }: FoodieSpotLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [vegMode, setVegMode] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {/* Hamburger Icon - Replace with your preferred icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <span className="font-bold text-xl">SavorySearch</span>
          <div>{/* Add any header actions here */}</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar - Filters */}
        <aside className={cn(
          "w-80 bg-white transition-transform duration-300 md:translate-x-0 fixed md:static h-full z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-4 space-y-6">
            {/* Location Info - always visible */}
            <div>
              <LocationInfo />
            </div>

            {/* Filters */}
            <div className="space-y-6">
              {/* Distance Filter */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Distancia</h3>
                <DistanceFilter
                  selectedDistance={selectedDistance}
                  onDistanceChange={setSelectedDistance}
                />
              </div>

              {/* Cuisine Types Filter */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Tipos de Cocina</h3>
                <CuisineFilter
                  selectedCuisines={selectedCuisines}
                  onCuisineChange={setSelectedCuisines}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Valoración</h3>
                <RatingFilter
                  selectedRating={selectedRating}
                  onRatingChange={setSelectedRating}
                />
              </div>

              {/* Veg Mode Toggle */}
              <div>
                <VegModeToggle
                  vegMode={vegMode}
                  onVegModeChange={setVegMode}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
