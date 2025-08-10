
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Heart, UtensilsCrossed, Calendar, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteRestaurant {
  id: number;
  name: string;
  cuisine_types: string[];
  google_rating?: number;
  google_rating_count?: number;
  distance_km?: number;
  cover_image_url?: string;
  logo_url?: string;
  price_range: string;
  saved_at: string;
}

interface FavoriteDish {
  id: number;
  name: string;
  restaurant_name: string;
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
  const { setFavoriteState, refreshFavorites } = useFavorites();
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

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Cargar restaurantes favoritos
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('user_saved_restaurants')
        .select(`
          restaurant_id,
          saved_at,
          restaurants!inner(
            id,
            name,
            price_range,
            google_rating,
            google_rating_count,
            cover_image_url,
            logo_url,
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
        cuisine_types: item.restaurants.restaurant_cuisines?.map((rc: any) => rc.cuisine_types?.name).filter(Boolean) || [],
        google_rating: item.restaurants.google_rating,
        google_rating_count: item.restaurants.google_rating_count,
        price_range: item.restaurants.price_range,
        cover_image_url: item.restaurants.cover_image_url,
        logo_url: item.restaurants.logo_url,
        saved_at: item.saved_at
      })) || [];

      setFavoriteRestaurants(formattedRestaurants);

      // Cargar platos favoritos
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
        base_price: item.dishes.base_price,
        image_url: item.dishes.image_url,
        saved_at: item.saved_at
      })) || [];

      setFavoriteDishes(formattedDishes);

      // Cargar eventos favoritos
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
      toast({
        title: "Error",
        description: "No se pudieron cargar los favoritos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (type: 'restaurant' | 'dish' | 'event', id: number) => {
    if (!user) return;

    const key = `${type}-${id}`;
    setRemoving(prev => ({ ...prev, [key]: true }));

    try {
      let error;

      switch (type) {
        case 'restaurant':
          // Immediate optimistic updates
          setFavoriteState(id, false);
          setFavoriteRestaurants(prev => prev.filter(item => item.id !== id));
          
          ({ error } = await supabase.rpc('toggle_restaurant_favorite', {
            user_id_param: user.id,
            restaurant_id_param: id
          }));

          // Update global state after successful operation
          if (!error) {
            await refreshFavorites();
          }
          break;
        case 'dish':
          // Optimistic update
          setFavoriteDishes(prev => prev.filter(item => item.id !== id));
          
          ({ error } = await supabase.rpc('toggle_dish_favorite', {
            user_id_param: user.id,
            dish_id_param: id
          }));
          break;
        case 'event':
          // Optimistic update
          setFavoriteEvents(prev => prev.filter(item => item.id !== id));
          
          ({ error } = await supabase.rpc('toggle_event_favorite', {
            user_id_param: user.id,
            event_id_param: id
          }));
          break;
      }

      if (error) throw error;

      toast({
        title: "Eliminado de favoritos",
        description: "El elemento se ha eliminado de tus favoritos"
      });

    } catch (error) {
      console.error('Error removing favorite:', error);
      
      // Revert optimistic updates on error
      if (type === 'restaurant') {
        setFavoriteState(id, true);
        await loadFavorites(); // Reload to restore correct state
      }
      
      toast({
        title: "Error",
        description: "No se pudo eliminar de favoritos",
        variant: "destructive"
      });
    } finally {
      setRemoving(prev => ({ ...prev, [key]: false }));
    }
  };

  const subTabs = [
    { id: 'restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
    { id: 'dishes', label: 'Platos', icon: Heart },
    { id: 'events', label: 'Eventos', icon: Calendar }
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
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="restaurants" className="space-y-4 mt-6">
          {favoriteRestaurants.length === 0 ? (
            <div className="text-center py-8">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes restaurantes favoritos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteRestaurants.map((restaurant) => (
                <Card key={restaurant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={restaurant.cover_image_url || restaurant.logo_url || "/placeholder.svg"} 
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{restaurant.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{restaurant.cuisine_types.slice(0, 2).join(', ')}</Badge>
                          {restaurant.google_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{restaurant.google_rating}</span>
                              {restaurant.google_rating_count && (
                                <span className="text-xs">({restaurant.google_rating_count})</span>
                              )}
                            </div>
                          )}
                          <span>{restaurant.price_range}</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFavorite('restaurant', restaurant.id)}
                        disabled={removing[`restaurant-${restaurant.id}`]}
                      >
                        {removing[`restaurant-${restaurant.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dishes" className="space-y-4 mt-6">
          {favoriteDishes.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes platos favoritos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteDishes.map((dish) => (
                <Card key={dish.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={dish.image_url || "/placeholder.svg"} 
                        alt={dish.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{dish.name}</h4>
                        <p className="text-sm text-muted-foreground">{dish.restaurant_name}</p>
                        <p className="font-medium text-primary">€{dish.base_price}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFavorite('dish', dish.id)}
                        disabled={removing[`dish-${dish.id}`]}
                      >
                        {removing[`dish-${dish.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          {favoriteEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tienes eventos favoritos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={event.image_url || "/placeholder.svg"} 
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.restaurant_name}</p>
                        <p className="text-sm">{event.event_date} • {event.start_time}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFavorite('event', event.id)}
                        disabled={removing[`event-${event.id}`]}
                      >
                        {removing[`event-${event.id}`] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
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
