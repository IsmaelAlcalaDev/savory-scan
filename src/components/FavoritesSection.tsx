
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
import RestaurantCard from '@/components/RestaurantCard';

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
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    // Subscribe to changes in user's saved restaurants
    const channel = supabase
      .channel(`favorites-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_saved_restaurants',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Favorites change detected:', payload);
          
          if (payload.eventType === 'DELETE' || 
              (payload.eventType === 'UPDATE' && payload.new && 
               typeof payload.new === 'object' && 'is_active' in payload.new && !payload.new.is_active)) {
            // Remove from local state immediately
            const restaurantId = (payload.old && typeof payload.old === 'object' && 'restaurant_id' in payload.old) 
              ? payload.old.restaurant_id 
              : (payload.new && typeof payload.new === 'object' && 'restaurant_id' in payload.new) 
                ? payload.new.restaurant_id 
                : null;
            
            if (restaurantId) {
              setFavoriteRestaurants(prev => prev.filter(item => item.id !== restaurantId));
            }
          } else if (payload.eventType === 'INSERT' && payload.new && 
                     typeof payload.new === 'object' && 'is_active' in payload.new && payload.new.is_active) {
            // Reload favorites to get the new one with full data
            loadFavorites();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load favorite restaurants with all needed data
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
      // Remove from local state immediately for better UX
      setFavoriteRestaurants(prev => prev.filter(item => item.id !== restaurantId));
    }
  };

  const removeFavorite = async (type: 'restaurant' | 'dish' | 'event', id: number) => {
    if (!user) return;

    // Verificar sesión antes de llamar RPC
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Remove favorite - auth session check', {
      sessionError,
      hasSession: !!sessionData?.session,
      sessionUserId: sessionData?.session?.user?.id,
      contextUserId: user.id,
    });

    if (!sessionData?.session || sessionData.session.user.id !== user.id) {
      toast({
        title: "Sesión no válida",
        description: "Vuelve a iniciar sesión para gestionar tus favoritos.",
        variant: "destructive"
      });
      return;
    }

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
          if (error) {
            console.error('RPC error (restaurant):', {
              error,
              code: (error as any)?.code,
              details: (error as any)?.details,
              hint: (error as any)?.hint,
              message: (error as any)?.message
            });
          }

          if (!error) {
            await refreshFavorites();
          }
          break;
        case 'dish':
          setFavoriteDishes(prev => prev.filter(item => item.id !== id));
          
          ({ error } = await supabase.rpc('toggle_dish_favorite', {
            user_id_param: user.id,
            dish_id_param: id
          }));
          if (error) {
            console.error('RPC error (dish):', {
              error,
              code: (error as any)?.code,
              details: (error as any)?.details,
              hint: (error as any)?.hint,
              message: (error as any)?.message
            });
          }
          break;
        case 'event':
          setFavoriteEvents(prev => prev.filter(item => item.id !== id));
          
          ({ error } = await supabase.rpc('toggle_event_favorite', {
            user_id_param: user.id,
            event_id_param: id
          }));
          if (error) {
            console.error('RPC error (event):', {
              error,
              code: (error as any)?.code,
              details: (error as any)?.details,
              hint: (error as any)?.hint,
              message: (error as any)?.message
            });
          }
          break;
      }

      if (error) throw error;

      toast({
        title: "Eliminado de favoritos",
        description: "El elemento se ha eliminado de tus favoritos"
      });

    } catch (error: any) {
      console.error('Error removing favorite:', {
        error,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        message: error?.message
      });
      
      if (type === 'restaurant') {
        setFavoriteState(id, true);
        await loadFavorites();
      }
      
      toast({
        title: "Error",
        description: error?.message || "No se pudo eliminar de favoritos",
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
            <div className="space-y-3">
              {favoriteRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="relative">
                  <RestaurantCard
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    priceRange={restaurant.price_range}
                    googleRating={restaurant.google_rating}
                    googleRatingCount={restaurant.google_rating_count}
                    distance={restaurant.distance_km}
                    cuisineTypes={restaurant.cuisine_types}
                    establishmentType={restaurant.establishment_type}
                    favoritesCount={restaurant.favorites_count}
                    coverImageUrl={restaurant.cover_image_url}
                    logoUrl={restaurant.logo_url}
                    layout="list"
                    onFavoriteChange={handleFavoriteChange}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite('restaurant', restaurant.id);
                    }}
                    disabled={removing[`restaurant-${restaurant.id}`]}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-sm"
                  >
                    {removing[`restaurant-${restaurant.id}`] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
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
