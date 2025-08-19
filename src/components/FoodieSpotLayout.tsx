
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import SearchBar from './SearchBar';
import LocationInfo from './LocationInfo';
import CuisineFilter from './CuisineFilter';
import EstablishmentTypeFilter from './EstablishmentTypeFilter';
import PriceFilter from './PriceFilter';
import DietFilter from './DietFilter';
import FilterTags from './FilterTags';
import LoadMoreButton from './LoadMoreButton';

interface FoodieSpotLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  showFilters?: boolean;
  showLocationInfo?: boolean;
  showSearchBar?: boolean;
  className?: string;
}

export default function FoodieSpotLayout({
  title = 'FoodieSpot - Descubre los mejores restaurantes',
  description = 'Encuentra y explora los mejores restaurantes cerca de ti',
  children,
  showFilters = true,
  showLocationInfo = true,
  showSearchBar = true,
  className
}: FoodieSpotLayoutProps) {
  const { preferences, userLocation, loading, updating, updatePreferences, refetch } = useUserPreferences();

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="container mx-auto px-4 py-6 space-y-6">
          {showLocationInfo && (
            <LocationInfo 
              userLocation={userLocation}
              loading={loading}
            />
          )}
          
          {showSearchBar && (
            <SearchBar 
              onSearch={(query) => console.log('Search:', query)}
              placeholder="Buscar restaurantes o platos..."
            />
          )}
          
          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CuisineFilter />
                <EstablishmentTypeFilter />
                <PriceFilter />
                <DietFilter />
              </div>
              
              <FilterTags />
            </div>
          )}
          
          <main className="space-y-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
