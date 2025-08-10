
import React from 'react';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDishFavorites } from '@/hooks/useDishFavorites';

interface DishCardProps {
  id: number;
  name: string;
  basePrice: number;
  imageUrl?: string | null;
  restaurantName: string;
  cuisineTypes: string[];
  favoritesCount: number;
  onLoginRequired?: () => void;
}

const DishCard: React.FC<DishCardProps> = ({
  id,
  name,
  basePrice,
  imageUrl,
  restaurantName,
  cuisineTypes,
  favoritesCount,
  onLoginRequired
}) => {
  const { isFavorite, isToggling, toggleFavorite } = useDishFavorites();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('DishCard: Toggling favorite for dish:', id);
    await toggleFavorite(id, onLoginRequired);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-0 shadow-none">
      <div className="relative">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80&auto=format&fit=crop'}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <Button
          size="icon"
          variant="secondary"
          onClick={handleToggleFavorite}
          disabled={isToggling(id)}
          className={cn(
            'absolute top-3 right-3 rounded-full bg-white/90 hover:bg-white',
            isFavorite(id) ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <Heart className={cn('h-5 w-5', isFavorite(id) && 'fill-primary text-primary')} />
        </Button>
      </div>

      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-tight">{name}</h3>
            <p className="text-sm text-muted-foreground">{restaurantName}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">{basePrice.toFixed(2)}€</div>
          </div>
        </div>

        {cuisineTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {cuisineTypes.slice(0, 3).map((ct, idx) => (
              <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                {ct}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            {favoritesCount} favoritos
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DishCard;
