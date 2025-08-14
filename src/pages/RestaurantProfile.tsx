
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useRestaurantMenu, type Dish } from '@/hooks/useRestaurantMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import DishModal from '@/components/DishModal';
import RestaurantDishesGrid from '@/components/RestaurantDishesGrid';
import RestaurantPlatforms from '@/components/RestaurantPlatforms';
import CompactRestaurantSchedule from '@/components/CompactRestaurantSchedule';
import QuickActionTags from '@/components/QuickActionTags';
import DeliveryLogosSection from '@/components/DeliveryLogosSection';
import CompactRestaurantEvents from '@/components/CompactRestaurantEvents';
import CompactRestaurantPromotions from '@/components/CompactRestaurantPromotions';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RestaurantSocialSection from '@/components/RestaurantSocialSection';
import RestaurantProfileHeader from '@/components/RestaurantProfileHeader';
import RestaurantStatsSection from '@/components/RestaurantStatsSection';
import RestaurantNavSection from '@/components/RestaurantNavSection';
import RestaurantContactInfo from '@/components/RestaurantContactInfo';

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('servicios');

  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const scrollToSection = (sectionId: string) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      const elementPosition = element.offsetTop - 100;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === 'fotos') {
      setIsGalleryOpen(true);
    } else {
      setActiveSection(sectionId);
      scrollToSection(sectionId);
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

  const handleViewMenu = () => {
    navigate(`/carta-${restaurant?.slug}`);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="h-96 bg-gradient-to-r from-gray-300 to-gray-400 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 mx-4 max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Restaurante no encontrado</h1>
          <p className="text-gray-600 mb-8">Lo sentimos, no pudimos encontrar este restaurante.</p>
          <Button onClick={handleGoBack} className="bg-primary hover:bg-primary-dark">
            Volver a restaurantes
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = getCurrentImage();
  const allImages = getAllImages();

  return (
    <>
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header Section */}
        <RestaurantProfileHeader
          restaurant={restaurant}
          currentImage={currentImage}
          totalImages={totalImages}
          currentImageIndex={currentImageIndex}
          onGoBack={handleGoBack}
          onShare={handleShare}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          onGalleryOpen={() => setIsGalleryOpen(true)}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-12">
          {/* Stats Section */}
          <RestaurantStatsSection restaurant={restaurant} />

          {/* Navigation Section */}
          <RestaurantNavSection
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
            onViewMenu={handleViewMenu}
            hasPromotions={restaurant.promotions && restaurant.promotions.length > 0}
          />

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Quick Actions */}
            <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Acciones Rápidas</h3>
              <QuickActionTags
                phone={restaurant.phone}
                website={restaurant.website}
                email={restaurant.email}
                address={restaurant.address}
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
              />
            </section>

            {/* Services Section */}
            {restaurant.services.length > 0 && (
              <section 
                id="servicios"
                ref={(el) => sectionsRef.current['servicios'] = el}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                  <CheckCircle className="h-7 w-7 text-primary" />
                  Servicios Disponibles
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {restaurant.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{service}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Schedule Section */}
            <section 
              id="horarios"
              ref={(el) => sectionsRef.current['horarios'] = el}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <Clock className="h-7 w-7 text-primary" />
                Horarios de Apertura
              </h3>
              {restaurant.schedules.length > 0 ? (
                <CompactRestaurantSchedule schedules={restaurant.schedules} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Horarios no disponibles</p>
                </div>
              )}
            </section>

            {/* Delivery Section */}
            {restaurant.delivery_links && Object.keys(restaurant.delivery_links).length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <DeliveryLogosSection deliveryLinks={restaurant.delivery_links} />
              </section>
            )}

            {/* Promotions Section */}
            {restaurant.promotions && restaurant.promotions.length > 0 && (
              <section 
                id="promociones"
                ref={(el) => sectionsRef.current['promociones'] = el}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
              >
                <CompactRestaurantPromotions promotions={restaurant.promotions} />
              </section>
            )}

            {/* Events Section */}
            <section 
              id="eventos"
              ref={(el) => sectionsRef.current['eventos'] = el}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <CompactRestaurantEvents restaurantId={restaurant?.id || 0} />
            </section>

            {/* Contact Section */}
            <section 
              id="contacto"
              ref={(el) => sectionsRef.current['contacto'] = el}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                <Phone className="h-7 w-7 text-primary" />
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurant.phone && (
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="bg-blue-500 rounded-full p-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">Teléfono</p>
                      <a 
                        href={`tel:${restaurant.phone}`} 
                        className="text-lg font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="bg-green-500 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">Dirección</p>
                    <p className="text-lg font-semibold text-green-900">{restaurant.address}</p>
                  </div>
                </div>

                {restaurant.email && (
                  <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="bg-purple-500 rounded-full p-3">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">Email</p>
                      <a 
                        href={`mailto:${restaurant.email}`} 
                        className="text-lg font-semibold text-purple-900 hover:text-purple-700 transition-colors"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Social Section */}
            {restaurant.social_links && Object.keys(restaurant.social_links).length > 0 && (
              <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <RestaurantSocialSection socialLinks={restaurant.social_links} />
              </section>
            )}
          </div>
        </div>

        {/* Gallery Dialog */}
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0 bg-black">
            <div className="relative h-full">
              <div className="absolute top-4 left-4 z-10">
                <h2 className="text-2xl font-bold text-white bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                  Galería de {restaurant.name}
                </h2>
              </div>
              <div className="overflow-y-auto h-full p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allImages.map((image, index) => (
                    <div key={index} className="aspect-video overflow-hidden rounded-xl">
                      <img
                        src={image}
                        alt={`${restaurant.name} - imagen ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setIsGalleryOpen(false);
                        }}
                      />
                    </div>
                  ))}
                </div>
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
    </>
  );
}
