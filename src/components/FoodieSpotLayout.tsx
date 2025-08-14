
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHeader from './MobileHeader';
import TabletHeader from './TabletHeader';
import DesktopHeader from './DesktopHeader';
import SearchBar from './SearchBar';
import MenuModal from './MenuModal';
import LocationModal from './LocationModal';
import { useCuisineTypes } from '@/hooks/useCuisineTypes';
import { useDietTypes } from '@/hooks/useDietTypes';

interface FoodieSpotLayoutProps {
  initialTab?: string;
  children?: React.ReactNode;
}

export default function FoodieSpotLayout({ 
  initialTab = 'restaurants',
  children 
}: FoodieSpotLayoutProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Hooks para datos
  const { cuisineTypes } = useCuisineTypes();
  const { dietTypes } = useDietTypes();

  const appName = "FoodieSpot";
  const appLogoUrl = "/placeholder.svg";
  const currentLocationName = "Madrid, España";
  const isLoadingLocation = false;

  const handleLogoClick = () => {
    console.log('Logo clicked');
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
  };

  const handleMenuClick = () => {
    setShowMenuModal(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const renderCuisineTypes = () => {
    if (!cuisineTypes?.length) return null;
    
    return (
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cuisineTypes.slice(0, 8).map((cuisine) => (
            <button
              key={cuisine.id}
              className="flex-shrink-0 px-4 py-2 bg-background border border-border rounded-full text-sm hover:bg-accent transition-colors"
            >
              {cuisine.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFoodTypes = () => {
    if (!dietTypes?.length) return null;
    
    return (
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dietTypes.slice(0, 8).map((diet) => (
            <button
              key={diet.id}
              className="flex-shrink-0 px-4 py-2 bg-background border border-border rounded-full text-sm hover:bg-accent transition-colors"
            >
              {diet.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (isMobile) {
      return (
        <MobileHeader
          appName={appName}
          appLogoUrl={appLogoUrl}
          currentLocationName={currentLocationName}
          isLoadingLocation={isLoadingLocation}
          onLogoClick={handleLogoClick}
          onLocationClick={handleLocationClick}
          onMenuClick={handleMenuClick}
        />
      );
    } else if (window.innerWidth < 1024) {
      return (
        <TabletHeader
          appName={appName}
          appLogoUrl={appLogoUrl}
          currentLocationName={currentLocationName}
          isLoadingLocation={isLoadingLocation}
          onLogoClick={handleLogoClick}
          onLocationClick={handleLocationClick}
          onMenuClick={handleMenuClick}
        />
      );
    } else {
      return (
        <DesktopHeader
          appName={appName}
          appLogoUrl={appLogoUrl}
          currentLocationName={currentLocationName}
          isLoadingLocation={isLoadingLocation}
          searchQuery={searchTerm}
          onLogoClick={handleLogoClick}
          onLocationClick={handleLocationClick}
          onMenuClick={handleMenuClick}
          onSearchChange={handleSearchChange}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {renderHeader()}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Tipos de cocina/comida */}
        {activeTab === 'restaurants' ? renderCuisineTypes() : renderFoodTypes()}
        
        {/* Buscador - Solo en móvil y tablet */}
        {(isMobile || window.innerWidth < 1024) && (
          <div className="px-4 mb-6">
            <SearchBar
              searchQuery={searchTerm}
              onSearchChange={handleSearchChange}
              activeTab={activeTab}
            />
          </div>
        )}

        {/* Children content */}
        {children}
      </main>

      {/* Modals */}
      <MenuModal 
        open={showMenuModal} 
        onOpenChange={setShowMenuModal}
      />
      
      <LocationModal
        open={showLocationModal}
        onOpenChange={setShowLocationModal}
      />
    </div>
  );
}
