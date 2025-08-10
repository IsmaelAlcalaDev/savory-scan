
import { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import SearchBar from '@/components/SearchBar';
import RestaurantCard from '@/components/RestaurantCard';
import LocationModal from '@/components/LocationModal';
import { useIPLocation } from '@/hooks/useIPLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, TrendingUp, MapPin } from 'lucide-react';

interface Restaurant {
  restaurant_id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  review_count?: number;
  distance_km?: number;
  cuisine_types: string[];
  establishment_type?: string;
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat?: number; lng?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Detectar ubicación automáticamente por IP
  const { location: ipLocation } = useIPLocation();

  // Establecer la ubicación automáticamente cuando se detecte por IP
  useEffect(() => {
    if (ipLocation && !currentLocation) {
      console.log('Index: Setting location from IP detection:', ipLocation);
      setCurrentLocation({
        lat: ipLocation.latitude,
        lng: ipLocation.longitude
      });
    }
  }, [ipLocation, currentLocation]);

  const searchRestaurants = useCallback(async (query: string) => {
    setLoading(true);
    try {
      console.log('Searching restaurants with query:', query);
      console.log('Current location:', currentLocation);

      const { data, error } = await supabase.rpc('search_restaurants', {
        search_query: query,
        user_lat: currentLocation?.lat || null,
        user_lng: currentLocation?.lng || null,
        max_distance_km: 10,
        limit_count: 20
      });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      console.log('Search results:', data);
      setRestaurants(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    searchRestaurants(query);
  }, [searchRestaurants]);

  const handleLocationSelect = useCallback((location: { type: 'gps' | 'manual'; data?: any }) => {
    if (location.type === 'gps' && location.data) {
      setCurrentLocation({
        lat: location.data.latitude,
        lng: location.data.longitude
      });
    } else if (location.type === 'manual' && location.data) {
      console.log('Manual location:', location.data.query);
    }
    
    if (searchQuery) {
      searchRestaurants(searchQuery);
    }
  }, [searchQuery, searchRestaurants]);

  return (
    <>
      <Helmet>
        <title>Descubre los Mejores Restaurantes | SavorySearch</title>
        <meta name="description" content="Encuentra los mejores restaurantes cerca de ti. Busca por ubicación, tipo de cocina, precio y más. Descubre platos únicos y experiencias gastronómicas excepcionales." />
        <meta name="keywords" content="restaurantes, comida, gastronomía, búsqueda restaurantes, platos, cocina" />
        <link rel="canonical" href="https://savorysearch.com/" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-16 px-4 bg-gradient-hero">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4">
                Descubre Sabores
                <br />
                <span className="bg-gradient-to-r from-accent to-primary-light bg-clip-text text-transparent">
                  Extraordinarios
                </span>
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Encuentra los mejores restaurantes y platos cerca de ti. 
                Tu próxima experiencia culinaria está a un clic de distancia.
              </p>
              {ipLocation && (
                <p className="text-sm text-primary-foreground/70 mt-2">
                  📍 Ubicación detectada: {ipLocation.city}, {ipLocation.region}
                </p>
              )}
            </div>

            <SearchBar
              onSearchChange={handleSearchChange}
              onLocationSelect={() => setShowLocationModal(true)}
              className="max-w-2xl mx-auto mb-8"
            />

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="hero" size="lg" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendencias
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Utensils className="h-5 w-5" />
                Explorar Cocinas
              </Button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  Resultados para "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">
                  {loading ? 'Buscando...' : `${restaurants.length} restaurantes encontrados`}
                </p>
              </div>
            )}

            {!searchQuery && !loading && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
                    <Utensils className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    ¡Empieza tu búsqueda gastronómica!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Usa el buscador de arriba para encontrar restaurantes increíbles cerca de ti.
                  </p>
                  <Button variant="search" onClick={() => setShowLocationModal(true)}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Establecer Ubicación
                  </Button>
                </div>
              </div>
            )}

            {/* Restaurant Grid */}
            {restaurants.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.restaurant_id}
                    id={restaurant.restaurant_id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    description={restaurant.description}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    googleRatingCount={restaurant.review_count}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                  />
                ))}
              </div>
            )}

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-48 bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        <LocationModal
          open={showLocationModal}
          onOpenChange={setShowLocationModal}
          onLocationSelect={handleLocationSelect}
        />
      </div>
    </>
  );
}
