
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Wheat, 
  Milk, 
  Heart, 
  Flame, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Star
} from 'lucide-react';
import type { Dish } from '@/hooks/useRestaurantMenu';

interface DishCardProps {
  dish: Dish;
  onImageClick: (dish: Dish) => void;
}

export default function DishCard({ dish, onImageClick }: DishCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDietIcon = (dish: Dish) => {
    const icons = [];
    if (dish.is_vegetarian) icons.push({ icon: Leaf, label: 'Vegetariano', color: 'text-green-500' });
    if (dish.is_vegan) icons.push({ icon: Leaf, label: 'Vegano', color: 'text-green-600' });
    if (dish.is_gluten_free) icons.push({ icon: Wheat, label: 'Sin gluten', color: 'text-amber-500' });
    if (dish.is_lactose_free) icons.push({ icon: Milk, label: 'Sin lactosa', color: 'text-blue-500' });
    if (dish.is_healthy) icons.push({ icon: Heart, label: 'Saludable', color: 'text-red-500' });
    return icons;
  };

  const getSpiceLevel = (level: number) => {
    if (level === 0) return null;
    return Array.from({ length: level }, (_, i) => (
      <Flame key={i} className="h-3 w-3 text-red-500 fill-current" />
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <Card className="bg-gradient-card border-glass shadow-card hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        {/* Image */}
        {dish.image_url && (
          <div 
            className="relative h-48 w-full cursor-pointer overflow-hidden group"
            onClick={() => onImageClick(dish)}
          >
            <img
              src={dish.image_url}
              alt={dish.image_alt || dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {dish.is_featured && (
              <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                <Star className="h-3 w-3 mr-1" />
                Destacado
              </Badge>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1 mb-1">
                {dish.name}
              </h3>
              
              {/* Price */}
              <div className="text-right">
                {dish.variants && dish.variants.length > 0 ? (
                  <div className="space-y-1">
                    {dish.variants.slice(0, isExpanded ? undefined : 1).map((variant) => (
                      <div key={variant.id} className="text-sm">
                        <span className="text-muted-foreground">{variant.name}: </span>
                        <span className="font-semibold text-primary">
                          {formatPrice(variant.price)}
                        </span>
                        {variant.is_default && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Por defecto
                          </Badge>
                        )}
                      </div>
                    ))}
                    {!isExpanded && dish.variants.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        +{dish.variants.length - 1} más opciones
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-bold text-xl text-primary">
                    {formatPrice(dish.base_price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick info */}
          <div className="flex items-center gap-3 mb-3">
            {/* Diet icons */}
            <div className="flex items-center gap-1">
              {getDietIcon(dish).slice(0, 3).map(({ icon: Icon, label, color }, index) => (
                <Icon key={index} className={`h-4 w-4 ${color}`} title={label} />
              ))}
            </div>

            {/* Spice level */}
            {dish.spice_level > 0 && (
              <div className="flex items-center gap-1" title={`Nivel de picante: ${dish.spice_level}`}>
                {getSpiceLevel(dish.spice_level)}
              </div>
            )}

            {/* Preparation time */}
            {dish.preparation_time_minutes && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">{dish.preparation_time_minutes}min</span>
              </div>
            )}
          </div>

          {/* Description preview */}
          {dish.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {dish.description}
            </p>
          )}

          {/* Category */}
          {dish.category_name && (
            <Badge variant="outline" className="text-xs mb-3">
              {dish.category_name}
            </Badge>
          )}

          {/* Expand button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full gap-2 mt-2"
          >
            {isExpanded ? (
              <>
                Menos detalles
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Más detalles
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              {/* Full description */}
              {dish.description && (
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-muted-foreground text-sm">
                    {dish.description}
                  </p>
                </div>
              )}

              {/* All variants */}
              {dish.variants && dish.variants.length > 1 && (
                <div>
                  <h4 className="font-medium mb-2">Opciones disponibles</h4>
                  <div className="space-y-2">
                    {dish.variants.map((variant) => (
                      <div key={variant.id} className="flex justify-between items-center p-2 bg-secondary/20 rounded">
                        <span className="text-sm">{variant.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">
                            {formatPrice(variant.price)}
                          </span>
                          {variant.is_default && (
                            <Badge variant="outline" className="text-xs">
                              Por defecto
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet information */}
              {getDietIcon(dish).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Información dietética</h4>
                  <div className="flex flex-wrap gap-2">
                    {getDietIcon(dish).map(({ icon: Icon, label, color }, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <Icon className={`h-3 w-3 ${color}`} />
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {dish.spice_level > 0 && (
                  <div>
                    <span className="font-medium">Picante:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {getSpiceLevel(dish.spice_level)}
                    </div>
                  </div>
                )}
                
                {dish.preparation_time_minutes && (
                  <div>
                    <span className="font-medium">Tiempo de preparación:</span>
                    <p className="text-muted-foreground">{dish.preparation_time_minutes} minutos</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
