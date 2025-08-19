
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurantMenuFallback } from '@/hooks/useRestaurantMenuFallback';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useState } from 'react';
import { ChevronLeft, Star, MapPin, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import DishCard from '@/components/DishCard';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import { Dish, MenuSection } from '@/types/dish';

interface RestaurantMenuProps {
  sections: MenuSection[];
  searchQuery: string;
  activeFilters: {
    categories: string[];
    dietTypes: string[];
    allergens: string[];
    priceRange: [number, number];
    spiceLevel: number;
  };
}

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    dietTypes: [],
    allergens: [],
    priceRange: [0, 100] as [number, number],
    spiceLevel: 0
  });

  const { restaurant, loading: profileLoading } = useRestaurantProfile(slug || '');
  const { 
    sections,
    dishes, 
    loading: menuLoading, 
    error 
  } = useRestaurantMenuFallback(restaurant?.id || 0);

  const isLoading = profileLoading || menuLoading;

  const filteredDishes = dishes?.filter((dish: Dish) => {
    if (searchQuery && !dish.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(dish.category_id.toString())) {
      return false;
    }

    if (activeFilters.dietTypes.length > 0) {
      const hasDietType = activeFilters.dietTypes.some(diet => {
        switch (diet) {
          case 'vegetarian': return dish.is_vegetarian;
          case 'vegan': return dish.is_vegan;
          case 'gluten_free': return dish.is_gluten_free;
          case 'healthy': return dish.is_healthy;
          default: return false;
        }
      });
      if (!hasDietType) return false;
    }

    if (activeFilters.spiceLevel > 0 && dish.spice_level < activeFilters.spiceLevel) {
      return false;
    }

    const price = dish.base_price;
    if (price < activeFilters.priceRange[0] || price > activeFilters.priceRange[1]) {
      return false;
    }

    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-main p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary/20 rounded"></div>
            <div className="h-32 bg-secondary/20 rounded"></div>
            <div className="h-48 bg-secondary/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="bg-gradient-card border-glass shadow-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Error al cargar el menú: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
        <Card className="bg-gradient-card border-glass shadow-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Restaurante no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header con información del restaurante */}
        <Card className="bg-gradient-card border-glass shadow-card">
          <CardHeader className="space-y-4">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>

            {/* Restaurant info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{restaurant.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span>{restaurant.google_rating || 'N/A'}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Badge variant="secondary">{restaurant.price_range}</Badge>
                    <Separator orientation="vertical" className="h-4" />
                    <MapPin className="h-4 w-4" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{restaurant.phone || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <span>{restaurant.website || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
                {restaurant.cover_image_url && (
                  <img
                    src={restaurant.cover_image_url}
                    alt={restaurant.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Menu content */}
        <div className="grid gap-6">
          {searchQuery || Object.values(activeFilters).some(f => 
            Array.isArray(f) ? f.length > 0 : f !== 0 && f !== activeFilters.priceRange
          ) ? (
            /* Filtered dishes view */
            <Card className="bg-gradient-card border-glass shadow-card">
              <CardHeader>
                <CardTitle>Platos encontrados ({filteredDishes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDishes.map((dish: Dish) => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            /* Section-based menu view */
            <RestaurantMenuSection
              section={sections[0] || { id: 1, name: 'Menú', dishes: [], restaurant_id: restaurant.id, description: '', display_order: 0, is_active: true, created_at: '', updated_at: '', deleted_at: null }}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
}
