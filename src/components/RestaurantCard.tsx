
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Clock, 
  Euro,
  Utensils,
  ExternalLink,
  Navigation,
  Phone,
  Globe
} from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  savedFrom?: string;
}

export default function RestaurantCard({ restaurant, savedFrom = 'search' }: RestaurantCardProps) {
  const formatDistance = (latitude: number, longitude: number) => {
    // This would calculate actual distance in a real app
    return "0.5 km";
  };

  // Helper function to get cuisine types (handles both formatted and raw data)
  const getCuisineTypes = () => {
    if (restaurant.cuisine_types && restaurant.cuisine_types.length > 0) {
      return restaurant.cuisine_types;
    }
    if (restaurant.restaurant_cuisines) {
      return restaurant.restaurant_cuisines
        .map(rc => rc.cuisine_types?.name)
        .filter(Boolean) as string[];
    }
    return [];
  };

  // Helper function to get services (handles both formatted and raw data)
  const getServices = () => {
    if (restaurant.services && restaurant.services.length > 0) {
      return restaurant.services;
    }
    if (restaurant.restaurant_services) {
      return restaurant.restaurant_services
        .map(rs => rs.services?.name)
        .filter(Boolean) as string[];
    }
    return [];
  };

  // Helper function to get establishment type
  const getEstablishmentType = () => {
    if (restaurant.establishment_type) {
      return restaurant.establishment_type;
    }
    return restaurant.establishment_types?.name;
  };

  const cuisineTypes = getCuisineTypes();
  const services = getServices();
  const establishmentType = getEstablishmentType();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-card border-glass shadow-card overflow-hidden">
      <div className="relative">
        {/* Restaurant Image */}
        <Link to={`/restaurant/${restaurant.slug}`} className="block">
          <div className="h-48 overflow-hidden">
            <img
              src={restaurant.cover_image_url || restaurant.logo_url || '/api/placeholder/400/300'}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            restaurantId={restaurant.id}
            favoritesCount={restaurant.favorites_count}
            savedFrom={savedFrom}
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          />
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            to={`/carta/${restaurant.slug}`}
            className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
            title="Ver carta"
          >
            <Utensils className="h-4 w-4" />
          </Link>
          <button
            className="bg-white text-foreground p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Cómo llegar"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Restaurant Info */}
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link 
                to={`/restaurant/${restaurant.slug}`}
                className="block group-hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">
                  {restaurant.name}
                </h3>
              </Link>
              
              {/* Rating & Distance */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {restaurant.google_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">
                      {restaurant.google_rating}
                      {restaurant.google_rating_count && (
                        <span className="text-xs">({restaurant.google_rating_count})</span>
                      )}
                    </span>
                  </div>
                )}
                
                {restaurant.latitude && restaurant.longitude && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formatDistance(restaurant.latitude, restaurant.longitude)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-1 text-primary font-medium">
              <Euro className="h-4 w-4" />
              <span>{restaurant.price_range}</span>
            </div>
          </div>

          {/* Description */}
          {restaurant.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {establishmentType && (
              <Badge variant="outline" className="text-xs">
                {establishmentType}
              </Badge>
            )}
            {cuisineTypes.slice(0, 2).map((cuisine, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {cuisine}
              </Badge>
            ))}
            {cuisineTypes.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{cuisineTypes.length - 2} más
              </Badge>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{services.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {restaurant.phone && (
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Llamar"
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
              {restaurant.website && (
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title="Sitio web"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Más información"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Opening Hours Indicator */}
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span className="text-green-600 font-medium">Abierto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
