
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Utensils } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { type Dish } from '@/hooks/useRestaurantDishes';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import ViewModeToggle from '@/components/ViewModeToggle';
import { useState } from 'react';

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurantProfile(slug || '');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list'); // Default to list view

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  const handleGoBack = () => {
    navigate(`/restaurant/${slug}`);
  };

  console.log('RestaurantMenu: Rendering with slug:', slug);
  console.log('RestaurantMenu: Restaurant data:', { restaurant, restaurantLoading, restaurantError });

  if (restaurantLoading) {
    console.log('RestaurantMenu: Showing loading state');
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (restaurantError || !restaurant) {
    console.log('RestaurantMenu: Showing error state:', restaurantError);
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
            <p className="text-muted-foreground mb-4">Error: {restaurantError}</p>
            <Button onClick={() => navigate('/restaurantes')}>
              Volver a restaurantes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log('RestaurantMenu: Restaurant found, ID:', restaurant.id);

  return (
    <>
      <Helmet>
        <title>Carta de {restaurant.name} | SavorySearch</title>
        <meta name="description" content={`Explora la carta completa de ${restaurant.name}. Descubre todos nuestros platos y encuentra tu favorito.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al restaurante
              </Button>

              {/* View Mode Toggle */}
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            <div className="flex items-center gap-6">
              {restaurant.logo_url && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                  <img 
                    src={restaurant.logo_url} 
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                  <Utensils className="h-8 w-8 text-primary" />
                  Carta de {restaurant.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  {restaurant.google_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {restaurant.google_rating}
                        {restaurant.google_rating_count && (
                          <span className="text-xs ml-1">({restaurant.google_rating_count})</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="secondary">
                    {restaurant.establishment_type}
                  </Badge>
                  {restaurant.cuisine_types.map((cuisine, index) => (
                    <Badge key={index} variant="outline">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <RestaurantDishesGrid
            restaurantId={restaurant.id}
            viewMode={viewMode}
            onDishClick={handleDishClick}
          />
        </div>

        {/* Dish Modal */}
        <DishModal
          dish={selectedDish}
          restaurantId={restaurant.id}
          isOpen={isDishModalOpen}
          onClose={closeDishModal}
        />
      </div>
    </>
  );
}
