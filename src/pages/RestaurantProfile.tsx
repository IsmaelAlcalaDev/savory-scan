import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Star, MapPin, Phone, Globe, Mail, Heart, Share2, Clock, Users, Car, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useRestaurantProfile } from '@/hooks/useRestaurantProfile';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useAuth } from '@/contexts/AuthContext';
import RestaurantGallery from '@/components/RestaurantGallery';
import RestaurantMenuSection from '@/components/RestaurantMenuSection';
import RestaurantEventsSection from '@/components/RestaurantEventsSection';
import CompactRestaurantSchedule from '@/components/CompactRestaurantSchedule';
import CompactRestaurantPromotions from '@/components/CompactRestaurantPromotions';
import RestaurantContactInfo from '@/components/RestaurantContactInfo';
import RestaurantSocialSection from '@/components/RestaurantSocialSection';
import DeliveryPlatformsSection from '@/components/DeliveryPlatformsSection';
import RestaurantServicesList from '@/components/RestaurantServicesList';
import FavoriteButton from '@/components/FavoriteButton';
import DietCertificationBadges from '@/components/DietCertificationBadges';
import BookingPlatformsSection from '@/components/BookingPlatformsSection';
import RestaurantActionButtons from '@/components/RestaurantActionButtons';
import LocationInfo from '@/components/LocationInfo';
import SecurityAlert from '@/components/SecurityAlert';
import { QuickActionTags } from '@/components/QuickActionTags';

const RestaurantProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { restaurant, loading, error } = useRestaurantProfile(slug || '');
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');

  if (!slug) {
    return <Navigate to="/restaurants" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Restaurante no encontrado</h1>
          <p className="text-muted-foreground mb-4">{error || 'El restaurante que buscas no existe o no está disponible.'}</p>
          <Button onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  const handleLoginRequired = () => {
    openAuthModal();
  };

  return (
    <div className="min-h-screen bg-background">
      <SecurityAlert />
      
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {restaurant.cover_image_url ? (
          <img 
            src={restaurant.cover_image_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-end gap-4 mb-4">
              {restaurant.logo_url && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white/20 bg-white/10 backdrop-blur-sm">
                  <img 
                    src={restaurant.logo_url} 
                    alt={`${restaurant.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  {restaurant.google_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{restaurant.google_rating}</span>
                      {restaurant.google_rating_count && (
                        <span className="text-white/80">({restaurant.google_rating_count})</span>
                      )}
                    </div>
                  )}
                  <span className="text-white/80">•</span>
                  <span>{restaurant.price_range}</span>
                  <span className="text-white/80">•</span>
                  <span>{restaurant.establishment_type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {restaurant.cuisine_types.slice(0, 3).map((cuisine, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <FavoriteButton
            restaurantId={restaurant.id}
            favoritesCount={restaurant.favorites_count}
            onLoginRequired={handleLoginRequired}
            savedFrom="profile_hero"
            size="lg"
          />
          <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <QuickActionTags
              onOpenNowToggle={() => {}}
              onHighRatedToggle={() => {}}
              onBudgetFriendlyToggle={() => {}}
              isOpenNow={false}
              isHighRated={restaurant.google_rating ? restaurant.google_rating >= 4.5 : false}
              isBudgetFriendly={restaurant.price_range === '€'}
            />

            {/* Diet Certifications */}
            <DietCertificationBadges restaurantId={restaurant.id} />

            {/* Navigation Tabs */}
            <div className="border-b">
              <nav className="flex space-x-8">
                {['menu', 'gallery', 'events'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'menu' && 'Menú'}
                    {tab === 'gallery' && 'Galería'}
                    {tab === 'events' && 'Eventos'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'menu' && <RestaurantMenuSection restaurantId={restaurant.id} />}
            {activeTab === 'gallery' && <RestaurantGallery images={restaurant.gallery} />}
            {activeTab === 'events' && <RestaurantEventsSection restaurantId={restaurant.id} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <RestaurantActionButtons restaurant={restaurant} />

            {/* Schedule */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horarios
                </h3>
                <CompactRestaurantSchedule schedules={restaurant.schedules} />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </h3>
                <LocationInfo
                  address={restaurant.address}
                  latitude={restaurant.latitude}
                  longitude={restaurant.longitude}
                />
              </CardContent>
            </Card>

            {/* Contact Info */}
            <RestaurantContactInfo restaurant={restaurant} />

            {/* Services */}
            {restaurant.services.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Servicios</h3>
                  <RestaurantServicesList services={restaurant.services} />
                </CardContent>
              </Card>
            )}

            {/* Promotions */}
            {restaurant.promotions.length > 0 && (
              <CompactRestaurantPromotions promotions={restaurant.promotions} />
            )}

            {/* Social Media */}
            <RestaurantSocialSection socialLinks={restaurant.social_links} />

            {/* Delivery Platforms */}
            <DeliveryPlatformsSection deliveryLinks={restaurant.delivery_links} />

            {/* Booking Platforms */}
            <BookingPlatformsSection restaurantId={restaurant.id} />

            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Estadísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favoritos totales</span>
                    <span className="font-medium">{restaurant.favorites_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Esta semana</span>
                    <span className="font-medium">{restaurant.favorites_count_week}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Este mes</span>
                    <span className="font-medium">{restaurant.favorites_count_month}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
