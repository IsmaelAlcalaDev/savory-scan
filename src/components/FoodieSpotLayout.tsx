import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import MobileHeader from '@/components/MobileHeader';
import TabletHeader from '@/components/TabletHeader';
import DesktopHeader from '@/components/DesktopHeader';
import BottomNavigation from '@/components/BottomNavigation';
import AuthModal from '@/components/AuthModal';
import AccountModal from '@/components/AccountModal';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/hooks/useLocation';

const APP_NAME = 'FoodieSpot';
const APP_LOGO_URL = '/logo.svg';

interface FoodieSpotLayoutProps {
  initialTab?: 'restaurants' | 'dishes' | 'account';
}

export default function FoodieSpotLayout({ initialTab = 'restaurants' }: FoodieSpotLayoutProps) {
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes" | "account">(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isOpen: isAuthModalOpen, openModal: openAuthModal, closeModal: closeAuthModal } = useAuthModal();
  const [isAccountModalOpen, setAccountModalOpen] = useState(false);
  const { user } = useAuth();
  const {
    currentLocationName,
    isLoadingLocation,
    getCurrentLocation
  } = useLocation();

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const handleLogoClick = () => {
    // Navigate to home or perform other actions
    console.log('Logo clicked!');
  };

  const handleMenuClick = () => {
    // Open the main menu
    console.log('Menu clicked!');
  };

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const handleAccountClick = () => {
    if (isMobile) {
      setActiveTab('account');
    } else {
      setAccountModalOpen(true);
    }
  };

  // Cast para el bottom navigation que solo maneja restaurants y dishes
  const handleBottomTabChange = (tab: "restaurants" | "dishes") => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (initialTab === 'account' && user) {
      setAccountModalOpen(true);
    }
  }, [initialTab, user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white">
        {isMobile ? (
          <MobileHeader
            appName={APP_NAME}
            appLogoUrl={APP_LOGO_URL}
            currentLocationName={currentLocationName}
            isLoadingLocation={isLoadingLocation}
            searchQuery={searchQuery}
            searchPlaceholder="Buscar restaurantes, platos..."
            isSearchFocused={isSearchFocused}
            onLogoClick={handleLogoClick}
            onLocationClick={handleLocationClick}
            onMenuClick={handleMenuClick}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
          />
        ) : isTablet ? (
          <TabletHeader
            appName={APP_NAME}
            appLogoUrl={APP_LOGO_URL}
            currentLocationName={currentLocationName}
            isLoadingLocation={isLoadingLocation}
            searchQuery={searchQuery}
            searchPlaceholder="Buscar restaurantes, platos..."
            isSearchFocused={isSearchFocused}
            onLogoClick={handleLogoClick}
            onLocationClick={handleLocationClick}
            onMenuClick={handleMenuClick}
            onAccountClick={handleAccountClick}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
          />
        ) : (
          <DesktopHeader
            appName={APP_NAME}
            appLogoUrl={APP_LOGO_URL}
            currentLocationName={currentLocationName}
            isLoadingLocation={isLoadingLocation}
            searchQuery={searchQuery}
            searchPlaceholder="Buscar restaurantes, platos..."
            isSearchFocused={isSearchFocused}
            onLogoClick={handleLogoClick}
            onLocationClick={handleLocationClick}
            onMenuClick={handleMenuClick}
            onAccountClick={handleAccountClick}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsSearchFocused(true)}
            onSearchBlur={() => setIsSearchFocused(false)}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">
            {activeTab === 'restaurants'
              ? 'Restaurantes'
              : activeTab === 'dishes'
                ? 'Platos'
                : 'Mi Cuenta'}
          </h1>
          <div className="py-4">
            {/* Your content here */}
            {activeTab === 'restaurants' && <div>Restaurants Content</div>}
            {activeTab === 'dishes' && <div>Dishes Content</div>}
            {activeTab === 'account' && <div>Account Content</div>}
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Only on Mobile */}
      {isMobile && (
        <BottomNavigation
          activeTab={activeTab === 'account' ? 'restaurants' : activeTab as "restaurants" | "dishes"}
          onTabChange={handleBottomTabChange}
        />
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <AccountModal open={isAccountModalOpen} onOpenChange={setAccountModalOpen} />
    </div>
  );
}
