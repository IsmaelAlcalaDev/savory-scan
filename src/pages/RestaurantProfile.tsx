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
  Share2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Users,
  TrendingUp,
  Percent,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import RestaurantActionButtons from '@/components/RestaurantActionButtons';
import RestaurantPlatforms from '@/components/RestaurantPlatforms';
import RestaurantContactInfo from '@/components/RestaurantContactInfo';

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

  const handleDishClick = (dish: Dish) => {
    console.log('RestaurantProfile: Dish clicked:', dish);
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant?.name,
        text: `Descubre ${restaurant?.name} en SavorySearch`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleGoBack = () => {
    navigate('/restaurantes');
  };

  // Get all available images (gallery + cover image)
  const getAllImages = () => {
    const images = [];
    
    if (restaurant?.gallery && restaurant.gallery.length > 0) {
      restaurant.gallery.forEach(item => {
        if (item.image_url) {
          images.push(item.image_url);
        }
      });
    }
    
    if (restaurant?.cover_image_url && images.length === 0) {
      images.push(restaurant.cover_image_url);
    }
    
    return images;
  };

  const getCurrentImage = () => {
    const allImages = getAllImages();
    if (allImages.length > 0) {
      return allImages[currentImageIndex] || allImages[0];
    }
    return restaurant?.cover_image_url || '/placeholder.svg';
  };

  const totalImages = getAllImages().length;

  const nextImage = () => {
    if (totalImages > 1) {
      setCurrentImageIndex(prev => prev >= totalImages - 1 ? 0 : prev + 1);
    }
  };

  const prevImage = () => {
    if (totalImages > 1) {
      setCurrentImageIndex(prev => prev <= 0 ? totalImages - 1 : prev - 1);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (totalImages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => prev >= totalImages - 1 ? 0 : prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalImages, restaurant?.id]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [restaurant?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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

  const getPriceRangeText = (priceRange: string) => {
    switch (priceRange) {
      case '€': return 'Económico';
      case '€€': return 'Moderado';
      case '€€€': return 'Caro';
      case '€€€€': return 'Muy caro';
      default: return priceRange;
    }
  };

  const currentImage = getCurrentImage();

  return (
    <>
      <Helmet>
        <title>{restaurant.name} | Restaurante en {restaurant.address}</title>
        <meta name="description" content={`${restaurant.description || `Descubre ${restaurant.name}, ${restaurant.establishment_type} especializado en ${restaurant.cuisine_types.join(', ')}.`} Reserva ahora y disfruta de una experiencia gastronómica única.`} />
        <meta name="keywords" content={`${restaurant.name}, restaurante, ${restaurant.cuisine_types.join(', ')}, ${restaurant.establishment_type}`} />
        <link rel="canonical" href={`https://savorysearch.com/restaurant/${restaurant.slug}`} />

        <meta property="og:title" content={`${restaurant.name} | SavorySearch`} />
        <meta property="og:description" content={restaurant.description || `Restaurante ${restaurant.name} - ${restaurant.establishment_type}`} />
        <meta property="og:image" content={currentImage || '/og-default.jpg'} />
        <meta property="og:url" content={`https://savorysearch.com/restaurant/${restaurant.slug}`} />
        <meta property="og:type" content="restaurant" />

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
          <img 
            key={`${restaurant.id}-${currentImageIndex}`}
            src={currentImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          {/* Back Arrow */}
          <Button
            onClick={handleGoBack}
            size="lg"
            variant="outline"
            className="absolute top-6 left-6 rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          
          {/* Share Button */}
          <Button
            onClick={handleShare}
            size="lg"
            variant="outline"
            className="absolute top-6 right-6 rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
          >
            <Share2 className="h-6 w-6 text-white" />
          </Button>

          {/* Carousel Navigation */}
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

          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  {restaurant.logo_url && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl flex-shrink-0 backdrop-blur-sm">
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
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Action Buttons */}
          <div className="mb-12">
            <RestaurantActionButtons
              phone={restaurant.phone}
              website={restaurant.website}
              email={restaurant.email}
              onShare={handleShare}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

            <TabsContent value="profile" className="space-y-12">
              {/* Description */}
              {restaurant.description && (
                <div className="text-center max-w-3xl mx-auto">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Platforms */}
                <div className="lg:col-span-2 space-y-12">
                  {/* Platforms Sections */}
                  <RestaurantPlatforms
                    category="social"
                    title="Síguenos en redes sociales"
                    restaurantLinks={restaurant.social_links || {}}
                  />

                  <RestaurantPlatforms
                    category="review"
                    title="Encuéntranos también en"
                    restaurantLinks={{
                      tripadvisor: restaurant.social_links?.tripadvisor,
                      google: restaurant.social_links?.google
                    }}
                  />

                  <RestaurantPlatforms
                    category="delivery"
                    title="Pide a domicilio"
                    restaurantLinks={restaurant.delivery_links || {}}
                  />

                  <RestaurantPlatforms
                    category="booking"
                    title="Reserva online"
                    restaurantLinks={restaurant.social_links || {}}
                  />

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

                  {/* Promotions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" />
                      Promociones y ofertas
                    </h3>
                    <div className="text-center py-12 text-muted-foreground bg-background/50 backdrop-blur-sm rounded-2xl border border-border/20">
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
                    <div className="text-center py-12 text-muted-foreground bg-background/50 backdrop-blur-sm rounded-2xl border border-border/20">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No hay eventos programados</p>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Contact Information */}
                  <RestaurantContactInfo
                    phone={restaurant.phone}
                    email={restaurant.email}
                    address={restaurant.address}
                    schedules={restaurant.schedules}
                  />

                  {/* Stats */}
                  <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
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
                    <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                      <h3 className="text-xl font-semibold mb-6">Horarios completos</h3>
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
