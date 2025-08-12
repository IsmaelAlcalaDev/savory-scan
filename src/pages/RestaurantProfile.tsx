import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Share2,
  Navigation,
  Utensils,
  Euro,
  Mail,
  Heart,
  Users,
  TrendingUp,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import RestaurantGallery from '@/components/RestaurantGallery';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const { sections: menuSections, loading: menuLoading } = useRestaurantMenu(restaurant?.id || 0);
  const [activeTab, setActiveTab] = useState('profile');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section Skeleton */}
        <div className="h-64 bg-muted animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
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

  const getSocialIcon = (url: string) => {
    if (url.includes('facebook')) return Facebook;
    if (url.includes('instagram')) return Instagram;
    if (url.includes('twitter') || url.includes('x.com')) return Twitter;
    return ExternalLink;
  };

  const formatDistance = (lat?: number, lng?: number) => {
    // This would calculate distance from user location
    return null;
  };

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
        <div className="relative h-80 bg-gradient-hero overflow-hidden">
          {restaurant.cover_image_url && (
            <img 
              src={restaurant.cover_image_url} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          
          <div className="absolute bottom-6 left-4 right-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end gap-4">
                {restaurant.logo_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                    <img 
                      src={restaurant.logo_url} 
                      alt={`${restaurant.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
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

                <div className="flex items-center gap-3">
                  <FavoriteButton
                    restaurantId={restaurant.id}
                    favoritesCount={restaurant.favorites_count}
                    savedFrom="profile_hero"
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="menu">Carta</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8">
              
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
                    <p className="text-muted-foreground mb-6 leading-relaxed">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Contact & Details */}
                  <Card className="bg-gradient-card border-glass shadow-card">
                    <CardHeader>
                      <CardTitle>Información de contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {restaurant.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Teléfono</p>
                              <p className="text-muted-foreground">{restaurant.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {restaurant.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-muted-foreground">{restaurant.email}</p>
                            </div>
                          </div>
                        )}

                        {restaurant.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Sitio web</p>
                              <a 
                                href={restaurant.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Visitar sitio
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Social Links */}
                      {restaurant.social_links && Object.keys(restaurant.social_links).length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="font-medium mb-3">Redes sociales</p>
                          <div className="flex gap-3">
                            {Object.entries(restaurant.social_links).map(([platform, url]) => {
                              const Icon = getSocialIcon(url as string);
                              return (
                                <Button
                                  key={platform}
                                  variant="outline"
                                  size="icon"
                                  asChild
                                  className="hover:bg-primary hover:text-primary-foreground"
                                >
                                  <a href={url as string} target="_blank" rel="noopener noreferrer">
                                    <Icon className="h-4 w-4" />
                                  </a>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      {restaurant.services.length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="font-medium mb-3">Servicios</p>
                          <div className="flex flex-wrap gap-2">
                            {restaurant.services.map((service, index) => (
                              <Badge key={index} variant="secondary">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Gallery */}
                  {restaurant.gallery.length > 0 && (
                    <RestaurantGallery gallery={restaurant.gallery} restaurantName={restaurant.name} />
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Stats */}
                  <Card className="bg-gradient-card border-glass shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Estadísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Total favoritos</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Esta semana</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count_week}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Este mes</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count_month}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule */}
                  {restaurant.schedules.length > 0 && (
                    <RestaurantSchedule schedules={restaurant.schedules} />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="menu" className="space-y-6">
              {menuLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-gradient-card border-glass shadow-card">
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1, 2, 3, 4, 5, 6].map((j) => (
                            <div key={j} className="space-y-3">
                              <Skeleton className="aspect-[4/3] rounded-lg" />
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : menuSections.length > 0 ? (
                <div className="space-y-8">
                  {menuSections.map((section) => (
                    <RestaurantMenuSection 
                      key={section.id} 
                      section={section}
                      restaurantId={restaurant?.id || 0}
                      onDishClick={handleDishClick}
                    />
                  ))}
                </div>
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

        {/* Dish Modal */}
        <DishModal
          dish={selectedDish}
          restaurantId={restaurant?.id || 0}
          isOpen={isDishModalOpen}
          onClose={closeDishModal}
        />
      </div>
    </>
  );
}
