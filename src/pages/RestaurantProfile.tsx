import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Share2,
  Navigation,
  Utensils,
  Euro
} from 'lucide-react';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price_range: string;
  google_rating?: number;
  google_rating_count?: number;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_image_url?: string;
  social_links?: any;
  delivery_links?: any;
  cuisine_types: string[];
  establishment_type?: string;
}

interface Dish {
  dish_id: number;
  dish_name: string;
  base_price: number;
  times_ordered: number;
}

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (slug) {
      fetchRestaurant(slug);
    }
  }, [slug]);

  const fetchRestaurant = async (restaurantSlug: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_restaurant_by_slug', {
        p_slug: restaurantSlug
      });

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      if (data && data.length > 0) {
        setRestaurant(data[0]);
        // Fetch popular dishes
        fetchPopularDishes(data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularDishes = async (restaurantId: number) => {
    try {
      const { data, error } = await supabase.rpc('get_popular_dishes', {
        restaurant_id_param: restaurantId,
        limit_count: 6
      });

      if (!error && data) {
        setDishes(data);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-pulse">
        <div className="h-64 bg-muted" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{restaurant.name} | Restaurante en {restaurant.address}</title>
        <meta name="description" content={`${restaurant.description || `Descubre ${restaurant.name}, ${restaurant.establishment_type} especializado en ${restaurant.cuisine_types.join(', ')}.`} Reserva ahora y disfruta de una experiencia gastronómica única.`} />
        <meta name="keywords" content={`${restaurant.name}, restaurante, ${restaurant.cuisine_types.join(', ')}, ${restaurant.establishment_type}`} />
        <link rel="canonical" href={`https://savorysearch.com/restaurant/${restaurant.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${restaurant.name} | SavorySearch`} />
        <meta property="og:description" content={restaurant.description || `Restaurante ${restaurant.name} - ${restaurant.establishment_type}`} />
        <meta property="og:image" content={restaurant.cover_image_url || restaurant.logo_url || '/og-default.jpg'} />
        <meta property="og:url" content={`https://savorysearch.com/restaurant/${restaurant.slug}`} />
        <meta property="og:type" content="restaurant" />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": restaurant.name,
            "description": restaurant.description,
            "address": restaurant.address,
            "telephone": restaurant.phone,
            "url": restaurant.website,
            "priceRange": restaurant.price_range,
            "servesCuisine": restaurant.cuisine_types,
            "aggregateRating": restaurant.google_rating ? {
              "@type": "AggregateRating",
              "ratingValue": restaurant.google_rating,
              "reviewCount": restaurant.google_rating_count
            } : undefined
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-64 bg-gradient-hero overflow-hidden">
          {restaurant.cover_image_url && (
            <img 
              src={restaurant.cover_image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
                {restaurant.google_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">
                      {restaurant.google_rating}
                      {restaurant.google_rating_count && (
                        <span className="text-xs ml-1">({restaurant.google_rating_count})</span>
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4" />
                  <span className="text-sm">{restaurant.price_range}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="menu">Menú</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Basic Info & Actions */}
              <Card className="bg-gradient-card border-glass shadow-card">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    {restaurant.cuisine_types.map((cuisine, index) => (
                      <Badge key={index} className="bg-primary/10 text-primary">
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.establishment_type && (
                      <Badge variant="outline">
                        {restaurant.establishment_type}
                      </Badge>
                    )}
                  </div>

                  {restaurant.description && (
                    <p className="text-muted-foreground mb-6">
                      {restaurant.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {restaurant.phone && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Llamar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <Navigation className="h-4 w-4" />
                      Cómo llegar
                    </Button>
                    {restaurant.website && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Web
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Compartir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu" className="space-y-6">
              {dishes.length > 0 ? (
                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      Platos Populares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {dishes.map((dish) => (
                        <div key={dish.dish_id} className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-smooth">
                          <div>
                            <h4 className="font-medium">{dish.dish_name}</h4>
                            {dish.times_ordered > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Pedido {dish.times_ordered} veces
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-primary">
                              €{dish.base_price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-card border-glass shadow-card">
                  <CardContent className="p-12 text-center">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Menú no disponible</h3>
                    <p className="text-muted-foreground">
                      El menú de este restaurante aún no está disponible en nuestra plataforma.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}