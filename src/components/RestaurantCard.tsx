
import { Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';

interface RestaurantCardProps {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priceRange: string;
  googleRating?: number;
  googleRatingCount?: number;
  distance?: number;
  cuisineTypes: string[];
  establishmentType?: string;
  services?: string[];
  favoritesCount?: number;
  coverImageUrl?: string;
  logoUrl?: string;
  onClick?: () => void;
  className?: string;
  onLoginRequired?: () => void;
}

export default function RestaurantCard({
  id,
  name,
  slug,
  description,
  priceRange,
  googleRating,
  googleRatingCount,
  distance,
  cuisineTypes,
  establishmentType,
  services = [],
  favoritesCount = 0,
  coverImageUrl,
  logoUrl,
  onClick,
  className,
  onLoginRequired
}: RestaurantCardProps) {
  // Safely get auth context - handle case where component is used outside AuthProvider
  let user = null;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.warn('RestaurantCard used outside AuthProvider context');
  }

  const { isFavorite, isToggling, toggleFavorite } = useFavorites();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/restaurant/${slug}`;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se active el click de la card
    
    if (!user && onLoginRequired) {
      onLoginRequired();
      return;
    }
    
    toggleFavorite(id, onLoginRequired);
  };

  // Elegir la mejor imagen disponible
  const displayImage = coverImageUrl || logoUrl;

  // Formatear la distancia
  const formatDistance = (distanceKm: number) => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  return (
    <div 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        className
      )}
      onClick={handleClick}
    >
      {/* Imagen rectangular con menos altura - cambiado de aspect-[4/3] a aspect-[5/3] */}
      <div className="aspect-[5/3] relative overflow-hidden rounded-lg mb-2">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : null}
        <div className={cn(
          "absolute inset-0 transition-smooth",
          displayImage ? "bg-black/20 group-hover:bg-black/10" : "bg-gradient-hero"
        )} />
        
        {/* Establishment type badge moved to bottom right */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-white text-foreground text-xs shadow-sm pointer-events-none">
            {establishmentType}
          </Badge>
        </div>
        
        {/* Favorites button in top right */}
        <div className="absolute top-3 right-3">
          <button
            onClick={handleFavoriteClick}
            disabled={isToggling(id)}
            className={cn(
              "flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20",
              "hover:bg-white transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Heart 
              className={cn(
                "h-3 w-3 transition-all duration-200",
                isFavorite(id) 
                  ? "text-red-500 fill-red-500" 
                  : "text-red-500",
                isToggling(id) && "animate-pulse"
              )} 
            />
            <span className="text-xs font-medium">{favoritesCount}</span>
          </button>
        </div>
      </div>

      {/* Datos fuera de la imagen, con menos espacio - reducido el space-y de 2 a 1 */}
      <div className="space-y-1">
        {/* Nombre del restaurante con logo y rating en la misma línea */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Logo del restaurante - increased size from w-6 h-6 to w-12 h-12 */}
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  // Ocultar logo si falla la carga
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-smooth">
            {name}
          </h3>
          {googleRating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground text-sm">{googleRating}</span>
              {googleRatingCount && (
                <span className="text-muted-foreground text-sm">({googleRatingCount})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Tipo de cocina · Rango de precio · Distancia en una sola línea */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="line-clamp-1">
            {cuisineTypes.slice(0, 2).join(', ')}
          </span>
          <span>•</span>
          <span className="text-foreground">{priceRange}</span>
          {distance && (
            <>
              <span>•</span>
              <span className="flex-shrink-0">{formatDistance(distance)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
