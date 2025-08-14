
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
      {/* Hero Image Section - Responsive Heights */}
      <div className="relative h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
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

        {/* Navigation Controls - Responsive Positioning */}
        <div className="absolute top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 right-4 sm:right-6 md:right-8 flex justify-between items-center z-20">
          <Button
            onClick={onGoBack}
            size="lg"
            variant="secondary"
            className="rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </Button>
          
          <div className="flex gap-2 sm:gap-3">
            {totalImages > 1 && (
              <Button
                onClick={onGalleryOpen}
                variant="secondary"
                className="rounded-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white transition-all duration-300 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">{totalImages} fotos</span>
                <span className="sm:hidden">{totalImages}</span>
              </Button>
            )}
            <Button
              onClick={onShare}
              size="lg"
              variant="secondary"
              className="rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Image Navigation Dots - Responsive */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
            {Array.from({ length: totalImages }, (_, index) => (
              <button
                key={index}
                onClick={() => {/* handle image change */}}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'bg-white w-6 sm:w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Restaurant Info Card - Responsive Margins and Padding */}
      <div className="relative -mt-20 sm:-mt-24 md:-mt-32 mx-3 sm:mx-4 md:mx-6 lg:mx-8 mb-6 sm:mb-8 z-10">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="flex flex-col space-y-6 sm:space-y-8">
              {/* Logo and Basic Info - Mobile First Layout */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {restaurant.logo_url && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-xl flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 mx-auto sm:mx-0">
                    <img 
                      src={restaurant.logo_url} 
                      alt={`${restaurant.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center sm:text-left">
                      {restaurant.name}
                    </h1>
                    {restaurant.google_rating && restaurant.google_rating >= 4.5 && (
                      <Award className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Location and Rating - Stack on Mobile */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-gray-600">
                    <div className="flex items-center gap-2 text-center">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base md:text-lg">{restaurant.address}</span>
                    </div>
                    {restaurant.google_rating && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm sm:text-base md:text-lg font-semibold">
                          {restaurant.google_rating}
                        </span>
                        {restaurant.google_rating_count && (
                          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                            ({restaurant.google_rating_count} reseñas)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tags - Responsive Grid */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20">
                      {getPriceRangeText(restaurant.price_range)}
                    </Badge>
                    {restaurant.establishment_type && (
                      <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border-gray-300">
                        {restaurant.establishment_type}
                      </Badge>
                    )}
                    {restaurant.cuisine_types.slice(0, 2).map((cuisine, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border-gray-300">
                        {cuisine}
                      </Badge>
                    ))}
                    {restaurant.cuisine_types.length > 2 && (
                      <Badge variant="outline" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border-gray-300">
                        +{restaurant.cuisine_types.length - 2} más
                      </Badge>
                    )}
                  </div>

                  {/* Stats - Responsive Layout */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-8">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">{restaurant.favorites_count} favoritos</span>
                    </div>
                    {restaurant.favorites_count_week > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-xs sm:text-sm">+{restaurant.favorites_count_week} esta semana</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button - Full Width on Mobile */}
              <div className="flex justify-center sm:justify-end">
                <FavoriteButton
                  restaurantId={restaurant.id}
                  favoritesCount={restaurant.favorites_count}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white border-0 px-6 sm:px-8 py-3 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
