
// Placeholder for client RestaurantMenu page - will be created
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu } from '@/hooks/useRestaurantMenu';
import { Skeleton } from '@/components/ui/skeleton';

const RestaurantMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurantProfile(slug || '');
  const { data: menuSections, isLoading: menuLoading } = useRestaurantMenu(restaurant?.id);

  if (restaurantLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex items-center gap-4 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="container py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Restaurante no encontrado</h2>
          <Button onClick={() => navigate('/restaurantes')}>
            Volver a restaurantes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/restaurant/${slug}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">Carta del restaurante</p>
          </div>
        </div>
      </div>

      {/* Menu content */}
      <div className="container py-6">
        {menuSections && menuSections.length > 0 ? (
          <div className="space-y-8">
            {menuSections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h2 className="text-2xl font-bold">{section.name}</h2>
                {section.description && (
                  <p className="text-muted-foreground">{section.description}</p>
                )}
                <div className="grid gap-4">
                  {section.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                        {item.ingredients && item.ingredients.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {item.ingredients.join(', ')}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="text-lg font-semibold">
                          ${item.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Carta no disponible</h2>
            <p className="text-muted-foreground">
              Este restaurante aún no ha publicado su carta digital.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
