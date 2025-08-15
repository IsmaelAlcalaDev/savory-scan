
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, Flame, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import DishFavoriteButton from './DishFavoriteButton';
import VariantSelector from './VariantSelector';
import DishImageModal from './DishImageModal';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishCardProps {
  dish: Dish;
  restaurantId: number;
  expandedDishId: number | null;
  onExpandedChange: (dishId: number | null) => void;
  isFirstInSection?: boolean;
}

export default function DishCard({ 
  dish, 
  restaurantId, 
  expandedDishId, 
  onExpandedChange,
  isFirstInSection = false
}: DishCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  const isExpanded = expandedDishId === dish.id;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const getDisplayPrice = () => {
    if (selectedVariantId) {
      const variant = dish.variants.find(v => v.id === selectedVariantId);
      return variant ? formatPrice(variant.price) : formatPrice(dish.base_price);
    }
    return formatPrice(dish.base_price);
  };

  const hasVariants = dish.variants && dish.variants.length > 1;
  const hasDescription = dish.description && dish.description.trim().length > 0;
  const shouldShowExpandButton = hasDescription || hasVariants;

  const toggleExpanded = () => {
    onExpandedChange(isExpanded ? null : dish.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dish.image_url) {
      setImageModalOpen(true);
    }
  };

  const spiceLevelIcons = Array.from({ length: dish.spice_level }, (_, i) => (
    <Flame key={i} className="h-3 w-3 fill-red-500 text-red-500" />
  ));

  const dietBadges = [];
  if (dish.is_vegetarian) dietBadges.push({ label: 'Vegetariano', color: 'bg-green-100 text-green-700' });
  if (dish.is_vegan) dietBadges.push({ label: 'Vegano', color: 'bg-green-100 text-green-700' });
  if (dish.is_gluten_free) dietBadges.push({ label: 'Sin Gluten', color: 'bg-blue-100 text-blue-700' });
  if (dish.is_lactose_free) dietBadges.push({ label: 'Sin Lactosa', color: 'bg-purple-100 text-purple-700' });
  if (dish.is_healthy) dietBadges.push({ label: 'Saludable', color: 'bg-emerald-100 text-emerald-700' });

  return (
    <Card className={cn(
      "bg-gradient-card border-glass shadow-card transition-all duration-300 hover:shadow-float group relative overflow-hidden",
      isFirstInSection && "mt-0"
    )}>
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image Section */}
          {dish.image_url && (
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={dish.image_url} 
                alt={dish.image_alt || dish.name}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={handleImageClick}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300" />
            </div>
          )}

          {/* Content Section */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with name, price and favorite */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-foreground leading-tight line-clamp-2 md:text-base text-base">
                  {dish.name}
                </h3>
                {dish.category_name && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {dish.category_name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-base md:text-lg text-primary">
                  {getDisplayPrice()}
                </span>
                <DishFavoriteButton
                  dishId={dish.id}
                  restaurantId={restaurantId}
                  favoritesCount={dish.favorites_count}
                  size="sm"
                  savedFrom="menu_card"
                />
              </div>
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
              {dish.preparation_time_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{dish.preparation_time_minutes} min</span>
                </div>
              )}
              
              {dish.spice_level > 0 && (
                <div className="flex items-center gap-1">
                  {spiceLevelIcons}
                </div>
              )}

              {dish.favorites_count > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                  <span>{dish.favorites_count}</span>
                </div>
              )}
            </div>

            {/* Diet badges - only show on expanded or if no description */}
            {(isExpanded || !hasDescription) && dietBadges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dietBadges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className={cn("text-xs px-2 py-0.5", badge.color)}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Expanded content */}
            {isExpanded && (
              <div className="space-y-3 pt-2 border-t border-border/50">
                {hasDescription && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {dish.description}
                  </p>
                )}

                {hasVariants && (
                  <div className="space-y-2">
                    <VariantSelector 
                      dish={dish} 
                      onVariantSelect={setSelectedVariantId}
                    />
                  </div>
                )}

                {/* Custom tags */}
                {dish.custom_tags && dish.custom_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dish.custom_tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Expand/Collapse button */}
        {shouldShowExpandButton && (
          <div className="px-4 pb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="w-full h-8 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <>
                  Mostrar menos
                  <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Ver más detalles
                  <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Image Modal */}
      <DishImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={dish.image_url}
        imageAlt={dish.image_alt || dish.name}
        dishName={dish.name}
      />
    </Card>
  );
}
