
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Heart, UtensilsCrossed, Calendar, Trash2 } from 'lucide-react';

export default function FavoritesSection() {
  const [activeSubTab, setActiveSubTab] = useState('restaurants');

  // Mock data
  const favoriteRestaurants = [
    {
      id: 1,
      name: "La Pizzería Italiana",
      cuisine: "Italiana",
      rating: 4.5,
      distance: "1.2 km",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Sushi Zen",
      cuisine: "Japonesa",
      rating: 4.8,
      distance: "2.1 km",
      image: "/placeholder.svg"
    }
  ];

  const favoriteDishes = [
    {
      id: 1,
      name: "Pizza Margherita",
      restaurant: "La Pizzería Italiana",
      price: "€12.50",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Salmón Teriyaki",
      restaurant: "Sushi Zen",
      price: "€18.90",
      image: "/placeholder.svg"
    }
  ];

  const favoriteEvents = [
    {
      id: 1,
      name: "Cata de Vinos",
      restaurant: "Restaurante Gourmet",
      date: "15 Mar 2024",
      time: "19:00",
      image: "/placeholder.svg"
    }
  ];

  const subTabs = [
    { id: 'restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
    { id: 'dishes', label: 'Platos', icon: Heart },
    { id: 'events', label: 'Eventos', icon: Calendar }
  ];

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
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{restaurant.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary">{restaurant.cuisine}</Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{restaurant.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{restaurant.distance}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
                        src={dish.image} 
                        alt={dish.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{dish.name}</h4>
                        <p className="text-sm text-muted-foreground">{dish.restaurant}</p>
                        <p className="font-medium text-primary">{dish.price}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
                        src={event.image} 
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">{event.restaurant}</p>
                        <p className="text-sm">{event.date} • {event.time}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
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
