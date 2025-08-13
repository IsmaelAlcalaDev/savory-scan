
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import DishModal from '@/components/DishModal';
import { useState } from 'react';
import type { Dish } from '@/hooks/useRestaurantMenu';

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4">
              <Button
                onClick={handleGoBack}
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Cargando carta...</div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4">
              <Button
                onClick={handleGoBack}
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Carta del Restaurante</h1>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Restaurante no encontrado</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Carta de {restaurant.name} | Menú completo</title>
        <meta name="description" content={`Descubre la carta completa de ${restaurant.name}. Explora todos nuestros platos, precios y especialidades.`} />
        <meta name="keywords" content={`${restaurant.name}, carta, menú, platos, ${restaurant.cuisine_types.join(', ')}`} />
        <link rel="canonical" href={`https://savorysearch.com/restaurant/${restaurant.slug}/menu`} />

        <meta property="og:title" content={`Carta de ${restaurant.name} | SavorySearch`} />
        <meta property="og:description" content={`Carta completa de ${restaurant.name} - ${restaurant.establishment_type}`} />
        <meta property="og:image" content={restaurant.cover_image_url || '/og-default.jpg'} />
        <meta property="og:url" content={`https://savorysearch.com/restaurant/${restaurant.slug}/menu`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-background sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4">
              <Button
                onClick={handleGoBack}
                size="lg"
                variant="outline"
                className="rounded-full w-12 h-12 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Carta de {restaurant.name}</h1>
                <p className="text-sm text-muted-foreground">{restaurant.establishment_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <RestaurantDishesGrid
            restaurantId={restaurant.id}
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
