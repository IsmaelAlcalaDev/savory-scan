import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
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
  ArrowLeft,
  Utensils,
  Images,
  Info,
  Truck,
  Calendar,
  MessageSquare,
  Phone,
  Navigation,
  Globe,
  Mail,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import RestaurantPlatforms from '@/components/RestaurantPlatforms';
import RestaurantEventsSection from '@/components/RestaurantEventsSection';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('descripcion');
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const menuSections = [
    { id: 'descripcion', label: 'Descripción', icon: Info },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'reservas', label: 'Reservas', icon: Calendar },
    { id: 'resenas', label: 'Reseñas', icon: MessageSquare },
    { id: 'servicios', label: 'Servicios', icon: CheckCircle },
    { id: 'promociones', label: 'Promociones', icon: Percent },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
  ];

  // Handle scroll for fixed header and active section detection
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerTop = headerRef.current.offsetTop;
        const scrollTop = window.scrollY;
        setIsHeaderFixed(scrollTop > headerTop);

        // Detect active section
        const sectionPositions = Object.entries(sectionsRef.current)
          .map(([id, element]) => ({
            id,
            top: element ? element.offsetTop - 200 : 0
          }))
          .sort((a, b) => a.top - b.top);

        const currentSection = sectionPositions
          .reverse()
          .find(section => scrollTop >= section.top);

        if (currentSection && currentSection.id !== activeSection) {
          setActiveSection(currentSection.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      const headerHeight = isHeaderFixed ? 100 : 0;
      const elementPosition = element.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDishClick = (dish: Dish) => {
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

  // Gallery functions
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

  // Auto-rotate images
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

  // Get current restaurant status
  const getCurrentStatus = () => {
    if (!restaurant?.schedules.length) return { isOpen: false, text: 'Horario no disponible' };
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todaySchedule = restaurant.schedules.find(s => s.day_of_week === currentDay);
    
    if (!todaySchedule || todaySchedule.is_closed) {
      return { isOpen: false, text: 'Cerrado hoy' };
    }
    
    const [openHour, openMinute] = todaySchedule.opening_time.split(':').map(Number);
    const [closeHour, closeMinute] = todaySchedule.closing_time.split(':').map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    
    if (currentTime >= openTime && currentTime <= closeTime) {
      return { isOpen: true, text: `Abierto hasta las ${todaySchedule.closing_time}` };
    }
    
    return { isOpen: false, text: `Cerrado - Abre a las ${todaySchedule.opening_time}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-80 bg-muted animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
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
  const allImages = getAllImages();
  const status = getCurrentStatus();

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

        {/* Fixed Navigation Header */}
        <div 
          ref={headerRef}
          className={`bg-background border-b border-border transition-all duration-300 ${
            isHeaderFixed ? 'fixed top-0 left-0 right-0 z-40 shadow-lg' : 'relative'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4 py-4">
              {/* Ver Carta Button - Fixed */}
              <Button
                onClick={() => setIsMenuOpen(true)}
                size="lg"
                className="flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
              >
                <Utensils className="h-5 w-5 mr-2" />
                Ver Carta
              </Button>

              {/* Fotos Button - Fixed */}
              <Button
                onClick={() => setIsGalleryOpen(true)}
                variant="outline"
                size="lg"
                className="flex-shrink-0"
              >
                <Images className="h-5 w-5 mr-2" />
                Fotos ({totalImages})
              </Button>

              {/* Navigation Menu - Scrollable without visible scrollbar */}
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {menuSections.map((section) => (
                    <Button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      size="lg"
                      className="flex-shrink-0 whitespace-nowrap"
                    >
                      <section.icon className="h-4 w-4 mr-1" />
                      {section.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
          {/* Descripción General */}
          <section 
            id="descripcion"
            ref={(el) => sectionsRef.current['descripcion'] = el}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold">Descripción General</h2>
            
            {restaurant.description && (
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                <p className="text-lg leading-relaxed">{restaurant.description}</p>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {restaurant.phone && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-20 flex-col gap-2"
                  asChild
                >
                  <a href={`tel:${restaurant.phone}`}>
                    <Phone className="h-6 w-6" />
                    <span className="text-sm">Llamar</span>
                  </a>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="lg"
                className="h-20 flex-col gap-2"
                onClick={() => {
                  // Implementar navegación con geolocalización
                  console.log('Abrir direcciones');
                }}
              >
                <Navigation className="h-6 w-6" />
                <span className="text-sm">Cómo llegar</span>
              </Button>

              {restaurant.website && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-20 flex-col gap-2"
                  asChild
                >
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-6 w-6" />
                    <span className="text-sm">Sitio web</span>
                  </a>
                </Button>
              )}

              {restaurant.email && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-20 flex-col gap-2"
                  asChild
                >
                  <a href={`mailto:${restaurant.email}`}>
                    <Mail className="h-6 w-6" />
                    <span className="text-sm">Email</span>
                  </a>
                </Button>
              )}
            </div>

            {/* Restaurant Status */}
            <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Estado del restaurante</h3>
              </div>
              <div className="flex items-center gap-3">
                {status.isOpen ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${status.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {status.text}
                </span>
              </div>
              {restaurant.schedules.length > 0 && (
                <div className="mt-4">
                  <RestaurantSchedule schedules={restaurant.schedules} />
                </div>
              )}
            </div>
          </section>

          {/* Delivery */}
          <section 
            id="delivery"
            ref={(el) => sectionsRef.current['delivery'] = el}
          >
            <RestaurantPlatforms
              category="delivery"
              title="Pide a domicilio"
              restaurantLinks={restaurant.delivery_links || {}}
            />
          </section>

          {/* Reservas */}
          <section 
            id="reservas"
            ref={(el) => sectionsRef.current['reservas'] = el}
          >
            <RestaurantPlatforms
              category="booking"
              title="Reserva online"
              restaurantLinks={restaurant.social_links || {}}
            />
          </section>

          {/* Reseñas */}
          <section 
            id="resenas"
            ref={(el) => sectionsRef.current['resenas'] = el}
          >
            <RestaurantPlatforms
              category="review"
              title="Encuéntranos también en"
              restaurantLinks={{
                tripadvisor: restaurant.social_links?.tripadvisor,
                google: restaurant.social_links?.google
              }}
            />
          </section>

          {/* Servicios */}
          {restaurant.services.length > 0 && (
            <section 
              id="servicios"
              ref={(el) => sectionsRef.current['servicios'] = el}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Servicios disponibles</h2>
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                <div className="flex flex-wrap gap-3">
                  {restaurant.services.map((service, index) => (
                    <Badge key={index} variant="default" className="px-4 py-2 text-sm">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Promociones */}
          <section 
            id="promociones"
            ref={(el) => sectionsRef.current['promociones'] = el}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Percent className="h-6 w-6 text-primary" />
              Promociones y ofertas
            </h2>
            <div className="text-center py-12 text-muted-foreground bg-background/50 backdrop-blur-sm rounded-2xl border border-border/20">
              <Percent className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No hay promociones activas en este momento</p>
            </div>
          </section>

          {/* Eventos */}
          <section 
            id="eventos"
            ref={(el) => sectionsRef.current['eventos'] = el}
          >
            <RestaurantEventsSection restaurantId={restaurant?.id || 0} />
          </section>

          {/* Redes Sociales */}
          <RestaurantPlatforms
            category="social"
            title="Síguenos en redes sociales"
            restaurantLinks={restaurant.social_links || {}}
          />

          {/* Stats */}
          <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              Estadísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Total favoritos</span>
                </div>
                <span className="text-2xl font-bold">{restaurant.favorites_count}</span>
              </div>
              
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Esta semana</span>
                </div>
                <span className="text-2xl font-bold">{restaurant.favorites_count_week}</span>
              </div>
              
              <div className="text-center p-4 bg-background/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Este mes</span>
                </div>
                <span className="text-2xl font-bold">{restaurant.favorites_count_month}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Modal */}
        <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Carta de {restaurant.name}</h2>
            </div>
            <div className="overflow-y-auto p-6">
              <RestaurantDishesGrid
                restaurantId={restaurant?.id || 0}
                onDishClick={handleDishClick}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Gallery Modal */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Galería de {restaurant.name}</h2>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allImages.map((image, index) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`${restaurant.name} - imagen ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setIsGalleryOpen(false);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dish Modal */}
        <DishModal
          dish={selectedDish}
          restaurantId={restaurant?.id || 0}
          isOpen={isDishModalOpen}
          onClose={closeDishModal}
        />
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
