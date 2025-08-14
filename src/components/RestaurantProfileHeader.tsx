
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Share2,
  ArrowLeft,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import { RestaurantProfile } from '@/hooks/useRestaurantProfile';
import FavoriteButton from '@/components/FavoriteButton';

interface RestaurantProfileHeaderProps {
  restaurant: RestaurantProfile;
  currentImage: string;
  totalImages: number;
  currentImageIndex: number;
  onGoBack: () => void;
  onShare: () => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onGalleryOpen: () => void;
}

export default function RestaurantProfileHeader({
  restaurant,
  currentImage,
  totalImages,
  currentImageIndex,
  onGoBack,
  onShare,
  onPrevImage,
  onNextImage,
  onGalleryOpen
}: RestaurantProfileHeaderProps) {
  const getPriceRangeText = (priceRange: string) => {
    switch (priceRange) {
      case '€': return 'Económico';
      case '€€': return 'Moderado';
      case '€€€': return 'Caro';
      case '€€€€': return 'Muy caro';
      default: return priceRange;
    }
  };

  return (
    <div className="relative">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <img 
            src={currentImage} 
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>
        
        {/* Overlay Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)'
        }} />

        {/* Navigation Controls */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
          <Button
            onClick={onGoBack}
            size="lg"
            variant="secondary"
            className="rounded-full w-14 h-14 p-0 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
          
          <div className="flex gap-3">
            {totalImages > 1 && (
              <Button
                onClick={onGalleryOpen}
                variant="secondary"
                className="rounded-full px-6 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white transition-all duration-300"
              >
                {totalImages} fotos
              </Button>
            )}
            <Button
              onClick={onShare}
              size="lg"
              variant="secondary"
              className="rounded-full w-14 h-14 p-0 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Share2 className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Image Navigation Dots */}
        {totalImages > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {Array.from({ length: totalImages }, (_, index) => (
              <button
                key={index}
                onClick={() => {/* handle image change */}}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Info Card */}
      <div className="relative -mt-32 mx-4 md:mx-8 mb-8 z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Logo and Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                {restaurant.logo_url && (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img 
                      src={restaurant.logo_url} 
                      alt={`${restaurant.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate">
                      {restaurant.name}
                    </h1>
                    {restaurant.google_rating && restaurant.google_rating >= 4.5 && (
                      <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Location and Rating */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="text-lg">{restaurant.address}</span>
                    </div>
                    {restaurant.google_rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">
                          {restaurant.google_rating}
                        </span>
                        {restaurant.google_rating_count && (
                          <span className="text-gray-500">
                            ({restaurant.google_rating_count} reseñas)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge variant="secondary" className="px-4 py-2 text-sm bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20">
                      {getPriceRangeText(restaurant.price_range)}
                    </Badge>
                    {restaurant.establishment_type && (
                      <Badge variant="outline" className="px-4 py-2 text-sm border-gray-300">
                        {restaurant.establishment_type}
                      </Badge>
                    )}
                    {restaurant.cuisine_types.slice(0, 2).map((cuisine, index) => (
                      <Badge key={index} variant="outline" className="px-4 py-2 text-sm border-gray-300">
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisine_types.length > 2 && (
                      <Badge variant="outline" className="px-4 py-2 text-sm border-gray-300">
                        +{restaurant.cuisine_types.length - 2} más
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-5 w-5" />
                      <span className="text-sm">{restaurant.favorites_count} favoritos</span>
                    </div>
                    {restaurant.favorites_count_week > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-sm">+{restaurant.favorites_count_week} esta semana</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 lg:items-end">
                <FavoriteButton
                  restaurantId={restaurant.id}
                  favoritesCount={restaurant.favorites_count}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white border-0 px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
