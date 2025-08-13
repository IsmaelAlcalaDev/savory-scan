import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
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
  ChevronRight,
  Clock
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import SocialLinksSection from '@/components/SocialLinksSection';
import DeliveryPlatformsSection from '@/components/DeliveryPlatformsSection';
import BookingPlatformsSection from '@/components/BookingPlatformsSection';
import ExternalLinksSection from '@/components/ExternalLinksSection';

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
  console.log('RestaurantProfile: Current image index:', currentImageIndex);
  console.log('RestaurantProfile: Gallery length:', restaurant?.gallery?.length);

  const handleDishClick = (dish: Dish) => {
    console.log('RestaurantProfile: Dish clicked:', dish);
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  // Get all available images (gallery + cover image)
  const getAllImages = () => {
    const images = [];
    
    // Add gallery images first
    if (restaurant?.gallery && restaurant.gallery.length > 0) {
      restaurant.gallery.forEach(item => {
        if (item.image_url) {
          images.push(item.image_url);
        }
      });
    }
    
    // Add cover image if not already in gallery and gallery is empty
    if (restaurant?.cover_image_url && images.length === 0) {
      images.push(restaurant.cover_image_url);
    }
    
    console.log('RestaurantProfile: All images:', images);
    return images;
  };

  // Get current image URL
  const getCurrentImage = () => {
    const allImages = getAllImages();
    if (allImages.length > 0) {
      const currentImg = allImages[currentImageIndex] || allImages[0];
      console.log('RestaurantProfile: Current image URL:', currentImg);
      return currentImg;
    }
    
    // Fallback to cover image or placeholder
    const fallbackImg = restaurant?.cover_image_url || '/placeholder.svg';
    console.log('RestaurantProfile: Using fallback image:', fallbackImg);
    return fallbackImg;
  };

  const totalImages = getAllImages().length;

  // Manual navigation functions
  const nextImage = () => {
    if (totalImages > 1) {
      console.log('RestaurantProfile: Next image clicked, current:', currentImageIndex);
      setCurrentImageIndex(prev => {
        const next = prev >= totalImages - 1 ? 0 : prev + 1;
        console.log('RestaurantProfile: Moving to image:', next);
        return next;
      });
    }
  };

  const prevImage = () => {
    if (totalImages > 1) {
      console.log('RestaurantProfile: Previous image clicked, current:', currentImageIndex);
      setCurrentImageIndex(prev => {
        const previous = prev <= 0 ? totalImages - 1 : prev - 1;
        console.log('RestaurantProfile: Moving to image:', previous);
        return previous;
      });
    }
  };

  const goToImage = (index: number) => {
    console.log('RestaurantProfile: Go to image clicked:', index);
    setCurrentImageIndex(index);
  };

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    console.log('RestaurantProfile: Setting up auto-rotation, total images:', totalImages);
    
    if (totalImages <= 1) {
      console.log('RestaurantProfile: Not enough images for rotation');
      return;
    }
    
    const interval = setInterval(() => {
      console.log('RestaurantProfile: Auto-rotating image');
      setCurrentImageIndex(prev => {
        const next = prev >= totalImages - 1 ? 0 : prev + 1;
        console.log('RestaurantProfile: Auto-rotation moving from', prev, 'to', next);
        return next;
      });
    }, 5000);

    return () => {
      console.log('RestaurantProfile: Clearing auto-rotation interval');
      clearInterval(interval);
    };
  }, [totalImages, restaurant?.id]);

  // Reset image index when restaurant changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [restaurant?.id]);

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

  const currentImage = getCurrentImage();

  console.log('RestaurantProfile: About to render, current image:', currentImage);
  console.log('RestaurantProfile: Total images:', totalImages);

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
        <meta property="og:image" content={currentImage || '/og-default.jpg'} />
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
        <div className="relative h-96 overflow-hidden">
          {/* Image with key to force re-render on change */}
          <img 
            key={`${restaurant.id}-${currentImageIndex}`}
            src={currentImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onLoad={() => console.log('RestaurantProfile: Image loaded:', currentImage)}
            onError={(e) => {
              console.error('RestaurantProfile: Image failed to load:', currentImage);
              // Try to set a fallback
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          {/* Carousel Navigation - Only show if more than 1 image */}
          {totalImages > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {Array.from({ length: totalImages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Date Overlay */}
          <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <div className="text-xs text-white/80 font-medium">
              {new Date().toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
            </div>
            <div className="text-2xl font-bold text-white">
              {new Date().getDate()}
            </div>
            <div className="text-xs text-white/80 font-medium">
              {new Date().toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
            </div>
          </div>

          {/* Restaurant Info Overlay - Transparent */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  {restaurant.logo_url && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl flex-shrink-0 backdrop-blur-sm">
                      <img 
                        src={restaurant.logo_url} 
                        alt={`${restaurant.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-2xl">
                      {restaurant.name}
                    </h1>
                    
                    {/* Badges above description */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {getPriceRangeText(restaurant.price_range)}
                      </Badge>
                      {restaurant.establishment_type && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {restaurant.establishment_type}
                        </Badge>
                      )}
                      {restaurant.cuisine_types.map((cuisine, index) => (
                        <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="drop-shadow">{restaurant.address}</span>
                      </div>
                      {restaurant.google_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium drop-shadow">
                            {restaurant.google_rating}
                            {restaurant.google_rating_count && (
                              <span className="text-xs ml-1">({restaurant.google_rating_count})</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FavoriteButton
                    restaurantId={restaurant.id}
                    favoritesCount={restaurant.favorites_count}
                    size="lg"
                    className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            console.log('RestaurantProfile: Tab changed to:', value);
            setActiveTab(value);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border-0 p-0 h-auto">
              <TabsTrigger 
                value="profile"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3 px-6 font-medium"
              >
                Perfil
              </TabsTrigger>
              <TabsTrigger 
                value="menu"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3 px-6 font-medium"
              >
                Carta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8">
              {/* Description */}
              {restaurant.description && (
                <div className="bg-transparent">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="bg-transparent">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {restaurant.phone && (
                    <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50" asChild>
                      <a href={`tel:${restaurant.phone}`}>
                        <Phone className="h-4 w-4" />
                        Llamar
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50">
                    <Navigation className="h-4 w-4" />
                    Cómo llegar
                  </Button>
                  {restaurant.website && (
                    <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50" asChild>
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                        Web
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50">
                    <Share2 className="h-4 w-4" />
                    Compartir
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50">
                    <Utensils className="h-4 w-4" />
                    Reservar
                  </Button>
                  {restaurant.email && (
                    <Button variant="outline" size="sm" className="gap-2 border-border/50 hover:border-primary/50" asChild>
                      <a href={`mailto:${restaurant.email}`}>
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Services */}
                  {restaurant.services.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Servicios</h3>
                      <div className="flex flex-wrap gap-3">
                        {restaurant.services.map((service, index) => (
                          <Badge key={index} variant="default" className="px-4 py-2 text-sm">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Networks */}
                  <SocialLinksSection 
                    socialLinks={restaurant.social_links}
                    socialProfiles={restaurant.social_profiles}
                  />

                  {/* External Links */}
                  <ExternalLinksSection 
                    website={restaurant.website}
                    tripadvisor_url={restaurant.tripadvisor_url}
                    menuLinks={restaurant.menu_links}
                  />

                  {/* Booking Platforms */}
                  <BookingPlatformsSection 
                    thefork_url={restaurant.thefork_url}
                    bookingPlatforms={restaurant.booking_platforms}
                  />

                  {/* Delivery Platforms */}
                  <DeliveryPlatformsSection 
                    glovo_url={restaurant.glovo_url}
                    ubereats_url={restaurant.ubereats_url}
                    justeat_url={restaurant.justeat_url}
                    deliveroo_url={restaurant.deliveroo_url}
                  />

                  {/* Promotions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" />
                      Promociones y ofertas
                    </h3>
                    <div className="text-center py-12 text-muted-foreground">
                      <Percent className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No hay promociones activas en este momento</p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Eventos
                    </h3>
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No hay eventos programados</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Estadísticas
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Total favoritos</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-border/30">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Esta semana</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count_week}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Este mes</span>
                        </div>
                        <span className="font-semibold">{restaurant.favorites_count_month}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  {restaurant.schedules.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Horarios
                      </h3>
                      <RestaurantSchedule schedules={restaurant.schedules} />
                    </div>
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
