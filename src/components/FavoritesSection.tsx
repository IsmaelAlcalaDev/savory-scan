import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, UtensilsCrossed, Calendar, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useSecurityLogger } from '@/hooks/useSecurityLogger';
import RestaurantCard from '@/components/RestaurantCard';
import FavoriteRestaurantItem from '@/components/FavoriteRestaurantItem';
import FavoriteDishItem from '@/components/FavoriteDishItem';

interface FavoriteRestaurant {
  id: number;
  name: string;
  slug: string;
  cuisine_types: string[];
  google_rating?: number;
  google_rating_count?: number;
  distance_km?: number;
  cover_image_url?: string;
  logo_url?: string;
  price_range: string;
  establishment_type?: string;
  favorites_count?: number;
  saved_at: string;
}

interface FavoriteDish {
  id: number;
  name: string;
  restaurant_name: string;
  restaurant_id: number;
  base_price: number;
  image_url?: string;
  saved_at: string;
}

interface FavoriteEvent {
  id: number;
  name: string;
  restaurant_name: string;
  event_date: string;
  start_time: string;
  image_url?: string;
  saved_at: string;
}

export default function FavoritesSection() {
  const { user } = useAuth();
  const { setFavoriteState, refreshFavorites, favoritesCount } = useFavorites();
  const { logSecurityEvent } = useSecurityLogger();
  const [activeSubTab, setActiveSubTab] = useState('restaurants');
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [favoriteDishes, setFavoriteDishes] = useState<FavoriteDish[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<FavoriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    const handleFavoriteToggled = (event: CustomEvent) => {
      const { restaurantId, isFavorite, newCount } = event.detail;
      
      if (isFavorite) {
        loadFavorites();
      } else {
        setFavoriteRestaurants(prev => prev.filter(item => item.id !== restaurantId));
      }
      
      setFavoriteRestaurants(prev =>
        prev.map(r => (r.id === restaurantId ? { ...r, favorites_count: newCount } : r))
      );
    };

    window.addEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
    return () => {
      window.removeEventListener('favoriteToggled', handleFavoriteToggled as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleDishFavoriteToggled = (event: CustomEvent) => {
      const { dishId, isFavorite } = event.detail;
      
      if (!isFavorite) {
        setFavoriteDishes(prev => prev.filter(item => item.id !== dishId));
      } else {
        loadFavorites();
      }
    };

    window.addEventListener('dishFavoriteToggled', handleDishFavoriteToggled as EventListener);
    return () => {
      window.removeEventListener('dishFavoriteToggled', handleDishFavoriteToggled as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleRestaurantFavoritesCountUpdated = (event: CustomEvent) => {
      const { restaurantId, newCount } = event.detail;
      
      setFavoriteRestaurants(prev =>
        prev.map(r => (r.id === restaurantId ? { ...r, favorites_count: newCount } : r))
      );
    };

    window.addEventListener('restaurantFavoritesCountUpdated', handleRestaurantFavoritesCountUpdated as EventListener);
    return () => {
      window.removeEventListener('restaurantFavoritesCountUpdated', handleRestaurantFavoritesCountUpdated as EventListener);
    };
  }, []);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: restaurants, error: restaurantsError } = await supabase
        .from('user_saved_restaurants')
        .select(`
          restaurant_id,
          saved_at,
          restaurants!inner(
            id,
            name,
            slug,
            price_range,
            google_rating,
            google_rating_count,
            cover_image_url,
            logo_url,
            favorites_count,
            establishment_types(name),
            restaurant_cuisines(
              cuisine_types(name)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('saved_at', { ascending: false });

      if (restaurantsError) throw restaurantsError;

      const formattedRestaurants = restaurants?.map((item: any) => ({
        id: item.restaurants.id,
        name: item.restaurants.name,
        slug: item.restaurants.slug,
        cuisine_types: item.restaurants.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
        google_rating: item.restaurants.google_rating,
        google_rating_count: item.restaurants.google_rating_count,
        price_range: item.restaurants.price_range,
        cover_image_url: item.restaurants.cover_image_url,
        logo_url: item.restaurants.logo_url,
        establishment_type: item.restaurants.establishment_types?.name,
        favorites_count: item.restaurants.favorites_count || 0,
        saved_at: item.saved_at
      })) || [];

      setFavoriteRestaurants(formattedRestaurants);

      const { data: dishes, error: dishesError } = await supabase
        .from('user_saved_dishes')
        .select(`
          dish_id,
          saved_at,
          dishes!inner(
            id,
            name,
            base_price,
            image_url,
            restaurant_id,
            restaurants(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('saved_at', { ascending: false });

      if (dishesError) throw dishesError;

      const formattedDishes = dishes?.map((item: any) => ({
        id: item.dishes.id,
        name: item.dishes.name,
        restaurant_name: item.dishes.restaurants?.name || '',
        restaurant_id: item.dishes.restaurant_id,
        base_price: item.dishes.base_price,
        image_url: item.dishes.image_url,
        saved_at: item.saved_at
      })) || [];

      setFavoriteDishes(formattedDishes);

      const { data: events, error: eventsError } = await supabase
        .from('user_saved_events')
        .select(`
          event_id,
          saved_at,
          events!inner(
            id,
            name,
            event_date,
            start_time,
            image_url,
            restaurant_id,
            restaurants(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('saved_at', { ascending: false });

      if (eventsError) throw eventsError;

      const formattedEvents = events?.map((item: any) => ({
        id: item.events.id,
        name: item.events.name,
        restaurant_name: item.events.restaurants?.name || '',
        event_date: item.events.event_date,
        start_time: item.events.start_time,
        image_url: item.events.image_url,
        saved_at: item.saved_at
      })) || [];

      setFavoriteEvents(formattedEvents);

    } catch (error) {
      console.error('Error loading favorites:', error);
      await logSecurityEvent('favorites_load_error', 'user', user.id, { error: String(error) });
      toast({
        title: "Error",
        description: "No se pudieron cargar los favoritos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (restaurantId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavoriteRestaurants(prev => prev.filter(item => item.id !== restaurantId));
    }
  };

  const subTabs = [
    { id: 'restaurants', label: 'Restaurantes', icon: UtensilsCrossed, count: favoriteRestaurants.length },
    { id: 'dishes', label: 'Platos', icon: Heart, count: favoriteDishes.length },
    { id: 'events', label: 'Eventos', icon: Calendar, count: favoriteEvents.length }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mis Favoritos</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {favoritesCount} total
          </span>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="restaurants" className="space-y-4 mt-6">
          {favoriteRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes restaurantes favoritos aún</h3>
              <p className="text-muted-foreground mb-4">
                Explora restaurantes y guarda tus favoritos para encontrarlos fácilmente
              </p>
              <Button onClick={() => (window.location.href = '/')} className="gap-2">
                <Plus className="h-4 w-4" />
                Explorar restaurantes
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteRestaurants.map((r) => (
                <FavoriteRestaurantItem
                  key={r.id}
                  id={r.id}
                  name={r.name}
                  slug={r.slug}
                  priceRange={r.price_range}
                  googleRating={r.google_rating}
                  googleRatingCount={r.google_rating_count}
                  cuisineTypes={r.cuisine_types}
                  establishmentType={r.establishment_type}
                  favoritesCount={r.favorites_count}
                  coverImageUrl={r.cover_image_url}
                  logoUrl={r.logo_url}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dishes" className="space-y-4 mt-6">
          {favoriteDishes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes platos favoritos aún</h3>
              <p className="text-muted-foreground mb-4">
                Explora menús de restaurantes y guarda tus platos favoritos
              </p>
              <Button onClick={() => (window.location.href = '/')} className="gap-2">
                <Plus className="h-4 w-4" />
                Explorar platos
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteDishes.map((dish) => (
                <FavoriteDishItem
                  key={dish.id}
                  id={dish.id}
                  name={dish.name}
                  restaurantName={dish.restaurant_name}
                  restaurantId={dish.restaurant_id}
                  basePrice={dish.base_price}
                  imageUrl={dish.image_url}
                  favoritesCount={0}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes eventos favoritos aún</h3>
              <p className="text-muted-foreground mb-4">
                Descubre eventos en restaurantes y guarda los que te interesen
              </p>
              <Button onClick={() => (window.location.href = '/')} className="gap-2">
                <Plus className="h-4 w-4" />
                Explorar eventos
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={event.image_url || '/placeholder.svg'}
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.restaurant_name}</p>
                        <p className="text-sm">
                          {event.event_date} • {event.start_time}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
