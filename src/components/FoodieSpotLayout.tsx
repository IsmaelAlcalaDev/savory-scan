
import { useState } from 'react';
import { cn } from '@/lib/utils';
import BottomNavigation from './BottomNavigation';
import DistanceFilter from './DistanceFilter';
import CuisineFilter from './CuisineFilter';
import RatingFilter from './RatingFilter';
import VegModeToggle from './VegModeToggle';
import { useIPLocation } from '@/hooks/useIPLocation';
import { useNearestLocation } from '@/hooks/useNearestLocation';
import { MapPin } from 'lucide-react';

interface FoodieSpotLayoutProps {
  children: React.ReactNode;
}

export default function FoodieSpotLayout({ children }: FoodieSpotLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDistances, setSelectedDistances] = useState<number[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<number[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [isVegMode, setIsVegMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('home');

  const { location: ipLocation } = useIPLocation();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
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
            {/* Location Info */}
            {ipLocation && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Ubicación detectada</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ipLocation.city}, {ipLocation.region}
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="space-y-6">
              {/* Distance Filter */}
              <div>
                <DistanceFilter
                  selectedDistances={selectedDistances}
                  onDistanceChange={setSelectedDistances}
                />
              </div>

              {/* Cuisine Types Filter */}
              <div>
                <CuisineFilter
                  selectedCuisines={selectedCuisines}
                  onCuisineChange={setSelectedCuisines}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <RatingFilter
                  selectedRatings={selectedRatings}
                  onRatingChange={setSelectedRatings}
                />
              </div>

              {/* Veg Mode Toggle */}
              <div>
                <VegModeToggle
                  isVegMode={isVegMode}
                  onToggle={setIsVegMode}
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
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
