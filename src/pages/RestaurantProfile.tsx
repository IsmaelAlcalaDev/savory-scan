import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, Share2, ChevronLeft, ChevronRight, Heart, Users, TrendingUp, ArrowLeft, Utensils, Images, Info, Clock, CheckCircle } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import FavoriteButton from '@/components/FavoriteButton';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import RestaurantPlatforms from '@/components/RestaurantPlatforms';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import QuickActionTags from '@/components/QuickActionTags';
import CompactRestaurantEvents from '@/components/CompactRestaurantEvents';
import CompactRestaurantPromotions from '@/components/CompactRestaurantPromotions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RestaurantSocialSection from '@/components/RestaurantSocialSection';
import RestaurantServicesList from '@/components/RestaurantServicesList';
import RestaurantDeliveryLinks from '@/components/RestaurantDeliveryLinks';
export default function RestaurantProfile() {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    restaurant,
    loading,
    error
  } = useRestaurantProfile(slug || '');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('servicios');
  const [isQuickActionsFixed, setIsQuickActionsFixed] = useState(false);
  const [isVerCartaFixed, setIsVerCartaFixed] = useState(false);
  const [isHeaderFixed, setIsHeaderFixed] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<{
    [key: string]: HTMLElement | null;
  }>({});
  const menuSections = [{
    id: 'fotos',
    label: 'Fotos',
    icon: Images,
    action: () => setIsGalleryOpen(true)
  }, {
    id: 'servicios',
    label: 'Servicios',
    icon: CheckCircle
  }, {
    id: 'reservas',
    label: 'Reservas',
    icon: Users
  }, ...(restaurant?.promotions && restaurant.promotions.length > 0 ? [{
    id: 'promociones',
    label: 'Promociones',
    icon: TrendingUp
  }] : []), {
    id: 'eventos',
    label: 'Eventos',
    icon: Users
  }];
  const getAllImages = () => {
    const images = [];

    // Always add cover image first if it exists
    if (restaurant?.cover_image_url) {
      images.push(restaurant.cover_image_url);
    }

    // Then add gallery images
    if (restaurant?.gallery && restaurant.gallery.length > 0) {
      restaurant.gallery.forEach(item => {
        if (item.image_url && item.image_url !== restaurant?.cover_image_url) {
          images.push(item.image_url);
        }
      });
    }
    return images;
  };
  const totalImages = getAllImages().length;
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current && heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const scrollTop = window.scrollY;
        const shouldBeFixed = scrollTop > heroHeight - 100;
        if (shouldBeFixed !== isHeaderFixed) {
          setIsHeaderFixed(shouldBeFixed);
        }
        const sectionPositions = Object.entries(sectionsRef.current).filter(([_, element]) => element !== null).map(([id, element]) => ({
          id,
          top: element ? element.offsetTop - 200 : 0
        })).sort((a, b) => a.top - b.top);
        const currentSection = sectionPositions.reverse().find(section => scrollTop >= section.top);
        if (currentSection && currentSection.id !== activeSection) {
          setActiveSection(currentSection.id);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection, isHeaderFixed]);
  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      if (heroRef.current && quickActionsRef.current) {
        const heroBottom = heroRef.current.offsetTop + heroRef.current.offsetHeight;
        const scrollTop = window.scrollY;
        const shouldBeFixed = scrollTop > heroBottom;
        if (shouldBeFixed !== isQuickActionsFixed) {
          setIsQuickActionsFixed(shouldBeFixed);
        }

        // Also check for Ver Carta button fixed state
        const quickActionsHeight = quickActionsRef.current.offsetHeight;
        const verCartaShouldBeFixed = scrollTop > heroBottom + quickActionsHeight + 20;
        if (verCartaShouldBeFixed !== isVerCartaFixed) {
          setIsVerCartaFixed(verCartaShouldBeFixed);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isQuickActionsFixed, isVerCartaFixed, isMobile]);
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
  const handleSectionClick = (section: typeof menuSections[0]) => {
    if (section.action) {
      section.action();
    } else {
      scrollToSection(section.id);
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
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };
  const handleGoBack = () => {
    navigate('/restaurantes');
  };
  const handleViewMenu = () => {
    navigate(`/carta-${restaurant?.slug}`);
  };
  const getCurrentImage = () => {
    const allImages = getAllImages();
    if (allImages.length > 0) {
      return allImages[currentImageIndex] || allImages[0];
    }
    return '/placeholder.svg';
  };
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
    return <div className="min-h-screen bg-background">
        <div className="h-80 bg-muted animate-pulse" />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>;
  }
  if (error || !restaurant) {
    return <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurante no encontrado</h1>
          </div>
        </div>
      </div>;
  }
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
  const allImages = getAllImages();

  // Add this helper function after the existing utility functions
  const getCurrentDayStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    const todaySchedule = restaurant?.schedules.find(s => s.day_of_week === currentDay);
    if (!todaySchedule || todaySchedule.is_closed) {
      return {
        status: 'Cerrado',
        className: 'text-red-500',
        isOpen: false
      };
    }
    if (currentTime >= todaySchedule.opening_time && currentTime <= todaySchedule.closing_time) {
      return {
        status: 'Abierto',
        className: 'text-green-500',
        isOpen: true
      };
    }
    return {
      status: 'Cerrado',
      className: 'text-red-500',
      isOpen: false
    };
  };
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };
  return <>
      <Helmet>
        <title>{restaurant.name} | Restaurante en {restaurant.address}</title>
        <meta name="description" content={`Descubre ${restaurant.name}, ${restaurant.establishment_type} especializado en ${restaurant.cuisine_types.join(', ')}. Reserva ahora y disfruta de una experiencia gastronómica única.`} />
        <meta name="keywords" content={`${restaurant.name}, restaurante, ${restaurant.cuisine_types.join(', ')}, ${restaurant.establishment_type}`} />
        <link rel="canonical" href={`https://savorysearch.com/restaurant/${restaurant.slug}`} />

        <meta property="og:title" content={`${restaurant.name} | SavorySearch`} />
        <meta property="og:description" content={`Restaurante ${restaurant.name} - ${restaurant.establishment_type}`} />
        <meta property="og:image" content={currentImage || '/og-default.jpg'} />
        <meta property="og:url" content={`https://savorysearch.com/restaurant/${restaurant.slug}`} />
        <meta property="og:type" content="restaurant" />

        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          "name": restaurant.name,
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
        <div ref={heroRef} className="relative h-64 md:h-96 sm:h-44 overflow-hidden">
          {currentImage && <img key={`${restaurant.id}-${currentImageIndex}`} src={currentImage} alt={restaurant.name} className="w-full h-full object-cover" onError={e => {
          e.currentTarget.src = '/placeholder.svg';
        }} />}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
          
          <Button onClick={handleGoBack} size="sm" variant="outline" className="absolute top-6 left-6 rounded-full w-10 h-10 p-0 bg-white border-white shadow-lg hover:bg-gray-50 hover:scale-110 transition-all">
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </Button>
          
          {/* Desktop: Buttons top right */}
          <div className="absolute top-6 right-6 flex gap-3 md:flex hidden">
            <FavoriteButton restaurantId={restaurant.id} favoritesCount={restaurant.favorites_count} size="lg" className="rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all" />
            <Button onClick={handleShare} size="lg" variant="outline" className="rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all">
              <Share2 className="h-6 w-6 text-white" />
            </Button>
          </div>

          {/* Mobile: Buttons bottom right */}
          <div className="absolute bottom-6 right-6 flex gap-2 md:hidden">
            <FavoriteButton restaurantId={restaurant.id} favoritesCount={restaurant.favorites_count} size="sm" className="rounded-full w-10 h-10 p-0 bg-white border-white shadow-lg hover:bg-gray-50 hover:scale-110 transition-all" />
            <Button onClick={handleShare} size="sm" variant="outline" className="rounded-full w-10 h-10 p-0 bg-white border-white shadow-lg hover:bg-gray-50 hover:scale-110 transition-all">
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          </div>

          {totalImages > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {Array.from({
            length: totalImages
          }, (_, index) => <button key={index} onClick={() => goToImage(index)} className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`} />)}
            </div>}

          {/* Desktop: Information over image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 hidden md:block">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  {restaurant.logo_url && <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-2xl flex-shrink-0 backdrop-blur-sm">
                      <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="w-full h-full object-cover" />
                    </div>}
                  
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white drop-shadow-2xl">
                      {restaurant.name}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {getPriceRangeText(restaurant.price_range)}
                      </Badge>
                      {restaurant.establishment_type && <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {restaurant.establishment_type}
                        </Badge>}
                      {restaurant.cuisine_types.map((cuisine, index) => <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                          {cuisine}
                        </Badge>)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="drop-shadow">{restaurant.address}</span>
                      </div>
                      {restaurant.google_rating && <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium drop-shadow">
                            {restaurant.google_rating}
                            {restaurant.google_rating_count && <span className="text-xs ml-1">({restaurant.google_rating_count})</span>}
                          </span>
                        </div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Ver Carta and Quick Actions combined block */}
        {isMobile && <div ref={quickActionsRef} className={`bg-background transition-all duration-300 ease-in-out ${isQuickActionsFixed ? 'fixed top-0 left-0 right-0 z-40 shadow-lg' : 'relative'}`}>
            <div className="max-w-6xl mx-auto px-4 pt-3 pb-0">
              <Button onClick={handleViewMenu} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-4 text-lg mb-3">
                <Utensils className="h-6 w-6 mr-2" />
                Ver Carta
              </Button>
            </div>
            <div className="max-w-6xl mx-auto px-4 pb-3">
              <QuickActionTags phone={restaurant.phone} website={restaurant.website} email={restaurant.email} address={restaurant.address} latitude={restaurant.latitude} longitude={restaurant.longitude} />
            </div>
          </div>}

        {/* Mobile: Restaurant information below combined block */}
        {isMobile && <div className={`bg-background ${isQuickActionsFixed ? 'mt-32' : ''}`}>
            <div className="max-w-6xl mx-auto px-4 py-3">
              {/* Row 1: Logo and Name */}
              <div className="flex items-center gap-3 mb-3">
                {restaurant.logo_url && <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border shadow-lg flex-shrink-0">
                    <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="w-full h-full object-cover" />
                  </div>}
                <h1 className="text-xl font-bold text-foreground flex-1">
                  {restaurant.name}
                </h1>
              </div>

              {/* Row 2: Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary">
                  {getPriceRangeText(restaurant.price_range)}
                </Badge>
                {restaurant.establishment_type && <Badge variant="secondary">
                    {restaurant.establishment_type}
                  </Badge>}
                {restaurant.cuisine_types.map((cuisine, index) => <Badge key={index} variant="secondary">
                    {cuisine}
                  </Badge>)}
              </div>

              {/* Row 3: Address and Rating */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.google_rating && <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">
                      {restaurant.google_rating}
                      {restaurant.google_rating_count && <span className="text-xs ml-1">({restaurant.google_rating_count})</span>}
                    </span>
                  </div>}
              </div>
            </div>
          </div>}

        <div className="max-w-6xl mx-auto px-4 py-6">
          {!isMobile ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <QuickActionTags phone={restaurant.phone} website={restaurant.website} email={restaurant.email} address={restaurant.address} latitude={restaurant.latitude} longitude={restaurant.longitude} />

                <RestaurantServicesList services={restaurant.services} />

                <RestaurantDeliveryLinks deliveryLinks={restaurant.delivery_links} />

                <section id="eventos" ref={el => sectionsRef.current['eventos'] = el}>
                  <CompactRestaurantEvents restaurantId={restaurant?.id || 0} />
                </section>

                {restaurant.social_links && Object.keys(restaurant.social_links).length > 0 && <section className="space-y-4">
                    <RestaurantSocialSection socialLinks={restaurant.social_links} />
                  </section>}
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="sticky top-8 space-y-6">
                  <Button onClick={handleViewMenu} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 py-4 text-lg">
                    <Utensils className="h-6 w-6 mr-2" />
                    Ver Carta
                  </Button>

                  <section id="horarios" ref={el => sectionsRef.current['horarios'] = el} className="space-y-4">
                    <RestaurantSchedule schedules={restaurant.schedules} />
                  </section>
                </div>
              </div>
            </div> : <div className="space-y-8">
              <section id="horarios" ref={el => sectionsRef.current['horarios'] = el} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Horarios
                  </h3>
                  {(() => {
                const currentStatus = getCurrentDayStatus();
                return <span className={`text-sm font-medium ${currentStatus.className}`}>
                        • {currentStatus.status}
                      </span>;
              })()}
                </div>
                {restaurant.schedules.length > 0 ? <div className="space-y-2">
                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((dayName, index) => {
                const schedule = restaurant.schedules.find(s => s.day_of_week === index);
                const isToday = new Date().getDay() === index;
                return <div key={index} className={`flex justify-between items-center py-2 px-3 rounded-lg transition-smooth ${isToday ? 'bg-primary/10' : 'bg-secondary/20'}`}>
                          <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                            {dayName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {schedule?.is_closed || !schedule ? 'Cerrado' : `${formatTime(schedule.opening_time)} - ${formatTime(schedule.closing_time)}`}
                          </span>
                        </div>;
              })}
                  </div> : <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Horarios no disponibles</p>
                  </div>}
              </section>

              <RestaurantServicesList services={restaurant.services} />

              <RestaurantDeliveryLinks deliveryLinks={restaurant.delivery_links} />

              <section id="eventos" ref={el => sectionsRef.current['eventos'] = el}>
                <CompactRestaurantEvents restaurantId={restaurant?.id || 0} />
              </section>

              {restaurant.social_links && Object.keys(restaurant.social_links).length > 0 && <section className="space-y-4">
                  <RestaurantSocialSection socialLinks={restaurant.social_links} />
                </section>}
            </div>}
        </div>

        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Galería de {restaurant.name}</h2>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allImages.map((image, index) => <div key={index} className="aspect-video overflow-hidden rounded-lg">
                    <img src={image} alt={`${restaurant.name} - imagen ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => {
                  setCurrentImageIndex(index);
                  setIsGalleryOpen(false);
                }} />
                  </div>)}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DishModal dish={selectedDish} restaurantId={restaurant?.id || 0} isOpen={isDishModalOpen} onClose={closeDishModal} />
      </div>

      <style dangerouslySetInnerHTML={{
      __html: `
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `
    }} />
    </>;
}