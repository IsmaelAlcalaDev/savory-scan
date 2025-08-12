
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Utensils, Leaf, Wheat, Milk, Heart, Flame, Clock, Plus } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import type { MenuSection, Dish } from '@/hooks/useRestaurantMenu';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  onDishClick?: (dish: Dish) => void;
}

export default function RestaurantMenuSection({ section, onDishClick }: RestaurantMenuSectionProps) {
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
    <Card className="bg-gradient-card border-glass shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          {section.name}
        </CardTitle>
        {section.description && (
          <p className="text-muted-foreground text-sm">{section.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {section.dishes.map((dish) => (
            <div key={dish.id} className="flex gap-4 p-4 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-smooth">
              {dish.image_url && (
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={dish.image_url}
                    alt={dish.image_alt || dish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground line-clamp-1">
                        {dish.name}
                      </h4>
                      {dish.is_featured && (
                        <Badge variant="secondary" className="bg-accent text-accent-foreground">
                          Destacado
                        </Badge>
                      )}
                    </div>
                    
                    {dish.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {dish.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      {/* Diet icons */}
                      <div className="flex items-center gap-1">
                        {getDietIcon(dish).map(({ icon: Icon, label, color }, index) => (
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

                    {/* Category */}
                    {dish.category_name && (
                      <Badge variant="outline" className="text-xs">
                        {dish.category_name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      {dish.variants && dish.variants.length > 0 ? (
                        <div className="space-y-1">
                          {dish.variants.map((variant) => (
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
                        </div>
                      ) : (
                        <span className="font-bold text-lg text-primary">
                          {formatPrice(dish.base_price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <FavoriteButton
                        restaurantId={0} // This would need the restaurant ID
                        favoritesCount={dish.favorites_count}
                        savedFrom="menu"
                        size="sm"
                      />
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDishClick?.(dish)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Añadir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
