
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Mail,
  Heart,
  Users,
  TrendingUp,
  ExternalLink,
  Facebook,
  Instagram,
  Twitter,
  Calendar,
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  console.log('RestaurantProfile: Rendering with slug:', slug);
  console.log('RestaurantProfile: Restaurant data:', restaurant);
  console.log('RestaurantProfile: Active tab:', activeTab);

  const handleDishClick = (dish: Dish) => {
    console.log('RestaurantProfile: Dish clicked:', dish);
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (!restaurant?.gallery || restaurant.gallery.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => 
        prev === restaurant.gallery.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [restaurant?.gallery]);

  const nextImage = () => {
    if (restaurant?.gallery && restaurant.gallery.length > 1) {
      setCurrentImageIndex(prev => 
        prev === restaurant.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (restaurant?.gallery && restaurant.gallery.length > 1) {
      setCurrentImageIndex(prev => 
        prev === 0 ? restaurant.gallery.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section Skeleton */}
        <div className="h-80 bg-muted animate-pulse" />
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
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              Volver al directorio
            </Button>
          </div>
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

  const getPriceRangeText = (priceRange: string) => {
    switch (priceRange) {
      case '€':
        return 'Económico';
      case '€€':
        return 'Moderado';
      case '€€€':
        return 'Caro';
      case '€€€€':
        return 'Muy caro';
      default:
        return priceRange;
    }
  };

  const getCurrentImage = () => {
    if (restaurant.gallery && restaurant.gallery.length > 0) {
      return restaurant.gallery[currentImageIndex]?.image_url;
    }
    return restaurant.cover_image_url;
  };

  console.log('RestaurantProfile: About to render tabs, restaurant ID:', restaurant?.id);

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
        <meta property="og:image" content={getCurrentImage() || '/og-default.jpg'} />
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
        {/* Hero Section with Image Carousel */}
        <div className="relative h-80 bg-gradient-hero overflow-hidden">
          {getCurrentImage() && (
            <img 
              src={getCurrentImage()} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Carousel Navigation */}
          {restaurant.gallery && restaurant.gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {restaurant.gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Overlay Info */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {restaurant.logo_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                        <img 
                          src={restaurant.logo_url} 
                          alt={`${restaurant.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {restaurant.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
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
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {getPriceRangeText(restaurant.price_range)}
                        </Badge>
                        {restaurant.establishment_type && (
                          <Badge variant="outline" className="border-white/30 text-white">
                            {restaurant.establishment_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {/* Add favorite logic */}}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Cuisine Types */}
                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisine_types.map((cuisine, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                      {cuisine}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Date Overlay */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
            </div>
            <div className="text-2xl font-bold">
              {new Date().getDate()}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            console.log('RestaurantProfile: Tab changed to:', value);
            setActiveTab(value);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border-0">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Perfil
              </TabsTrigger>
              <TabsTrigger 
                value="menu"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Carta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8">
              {/* Description */}
              {restaurant.description && (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {restaurant.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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
                    <Button variant="outline" size="sm" className="gap-2">
                      <Utensils className="h-4 w-4" />
                      Reservar
                    </Button>
                    {restaurant.email && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Services */}
                  {restaurant.services.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Servicios</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {restaurant.services.map((service, index) => (
                            <Badge key={index} variant="default">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Networks & External Links */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Enlaces externos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Social Links */}
                      {restaurant.social_links && Object.keys(restaurant.social_links).length > 0 && (
                        <div>
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

                      {/* External Platform Links */}
                      <div>
                        <p className="font-medium mb-3">Plataformas</p>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            TripAdvisor
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Utensils className="h-4 w-4" />
                            TheFork
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Promotions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-primary" />
                        Promociones y ofertas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay promociones activas en este momento</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Eventos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay eventos programados</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Stats */}
                  <Card>
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
              <RestaurantDishesGrid
                restaurantId={restaurant?.id || 0}
                onDishClick={handleDishClick}
              />
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
