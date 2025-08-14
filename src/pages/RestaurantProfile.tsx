import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Share2, Star, MapPin, Eye } from 'lucide-react';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { toast } from '@/hooks/use-toast';
import RestaurantSchedule from '@/components/RestaurantSchedule';
import RestaurantSocialSection from '@/components/RestaurantSocialSection';
import DeliveryPlatformsSection from '@/components/DeliveryPlatformsSection';
import RestaurantGallery from '@/components/RestaurantGallery';
import CompactRestaurantPromotions from '@/components/CompactRestaurantPromotions';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import FavoriteButton from '@/components/FavoriteButton';
import QuickActionTags from '@/components/QuickActionTags';

const RestaurantProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Calculate images and totalImages before using them
  const images = restaurant?.gallery?.length > 0 
    ? restaurant.gallery.map(img => img.image_url)
    : restaurant?.cover_image_url 
    ? [restaurant.cover_image_url]
    : [];
  
  const totalImages = images.length;

  useEffect(() => {
    const interval = setInterval(() => {
      if (totalImages > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [totalImages]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleShare = async () => {
    if (!restaurant) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name,
          text: `Descubre ${restaurant.name} en FoodieSpot`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive"
        });
      }
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando restaurante...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Restaurante no encontrado</h1>
          <p className="text-muted-foreground mb-4">{error || 'El restaurante que buscas no existe'}</p>
          <Button onClick={handleGoBack}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const formatViewsCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <>
      <Helmet>
        <title>{restaurant.name} - FoodieSpot</title>
        <meta name="description" content={`Descubre ${restaurant.name} en ${restaurant.address}. ${restaurant.cuisine_types.join(', ')}.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div ref={heroRef} className="relative h-96 md:h-96 sm:h-64 overflow-hidden">
          {currentImage && (
            <img 
              key={`${restaurant.id}-${currentImageIndex}`}
              src={currentImage} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <Button
            onClick={handleGoBack}
            size="lg"
            variant="outline"
            className="absolute top-6 left-6 rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          
          <div className="absolute top-6 right-6 flex gap-3">
            <FavoriteButton
              restaurantId={restaurant.id}
              favoritesCount={restaurant.favorites_count}
              size="lg"
              className="rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
            />
            <Button
              onClick={handleShare}
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 p-0 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 hover:scale-110 transition-all"
            >
              <Share2 className="h-6 w-6 text-white" />
            </Button>
          </div>

          {totalImages > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {Array.from({ length: totalImages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop: Information over image */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-6">
                {restaurant.logo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={restaurant.logo_url} 
                      alt={`${restaurant.name} logo`}
                      className="w-20 h-20 rounded-2xl object-cover bg-white/10 backdrop-blur-sm border border-white/20"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisine_types.map((cuisine, index) => (
                        <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                          {cuisine}
                        </Badge>
                      ))}
                      {restaurant.establishment_type && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {restaurant.establishment_type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-white">
                    {restaurant.google_rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{restaurant.google_rating}</span>
                        {restaurant.google_rating_count && (
                          <span className="text-white/80">({restaurant.google_rating_count})</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">{restaurant.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Information below image */}
        <div className="md:hidden">
          <div className="p-6 space-y-4">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-4">
              {restaurant.logo_url && (
                <div className="flex-shrink-0">
                  <img 
                    src={restaurant.logo_url} 
                    alt={`${restaurant.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover bg-muted"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
              </div>
            </div>

            {/* Etiquetas */}
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine_types.map((cuisine, index) => (
                <Badge key={index} variant="secondary">
                  {cuisine}
                </Badge>
              ))}
              {restaurant.establishment_type && (
                <Badge variant="secondary">
                  {restaurant.establishment_type}
                </Badge>
              )}
            </div>

            {/* Dirección, Rating y Visitas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{restaurant.address}</span>
              </div>
              
              <div className="flex items-center gap-6">
                {restaurant.google_rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{restaurant.google_rating}</span>
                    {restaurant.google_rating_count && (
                      <span className="text-muted-foreground text-sm">({restaurant.google_rating_count})</span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{formatViewsCount(restaurant.profile_views_count)} visitas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-8 pb-8">
          <div className="px-6">
            <QuickActionTags 
              phone={restaurant.phone}
              website={restaurant.website}
              address={restaurant.address}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
              deliveryLinks={restaurant.delivery_links}
            />
          </div>

          {restaurant.schedules && restaurant.schedules.length > 0 && (
            <div className="px-6">
              <RestaurantSchedule schedules={restaurant.schedules} />
            </div>
          )}

          {restaurant.promotions && restaurant.promotions.length > 0 && (
            <div className="px-6">
              <CompactRestaurantPromotions promotions={restaurant.promotions} />
            </div>
          )}

          <div className="px-6">
            <RestaurantMenuSection restaurantId={restaurant.id} />
          </div>

          {restaurant.gallery && restaurant.gallery.length > 1 && (
            <div className="px-6">
              <RestaurantGallery images={restaurant.gallery} restaurantName={restaurant.name} />
            </div>
          )}

          {(restaurant.social_links && Object.keys(restaurant.social_links).length > 0) && (
            <div className="px-6">
              <RestaurantSocialSection socialLinks={restaurant.social_links} />
            </div>
          )}

          {(restaurant.delivery_links && Object.keys(restaurant.delivery_links).length > 0) && (
            <div className="px-6">
              <DeliveryPlatformsSection deliveryLinks={restaurant.delivery_links} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RestaurantProfile;
