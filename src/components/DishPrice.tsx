
import { Badge } from '@/components/ui/badge';
import { usePromotions } from '@/hooks/usePromotions';

interface DishPriceProps {
  originalPrice: number;
  dishId: number;
  restaurantId: number;
  sectionId?: number;
  className?: string;
}

export default function DishPrice({ 
  originalPrice, 
  dishId, 
  restaurantId, 
  sectionId,
  className = "font-bold text-sm md:text-lg text-primary text-right flex-shrink-0"
}: DishPriceProps) {
  const { getPromotionForDish, calculateDiscountedPrice } = usePromotions(restaurantId);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  console.log('DishPrice - checking promotion for dish:', dishId, 'section:', sectionId, 'restaurant:', restaurantId);
  const promotion = getPromotionForDish(dishId, sectionId);
  console.log('DishPrice - found promotion:', promotion);

  if (!promotion) {
    console.log('DishPrice - no promotion found, showing original price:', originalPrice);
    return (
      <div className={className}>
        {formatPrice(originalPrice)}
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(originalPrice, promotion);
  console.log('DishPrice - original:', originalPrice, 'discounted:', discountedPrice, 'promotion:', promotion);

  return (
    <div className={className}>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground line-through">
            {formatPrice(originalPrice)}
          </span>
          <Badge variant="destructive" className="text-xs px-1 py-0">
            {promotion.discount_label}
          </Badge>
        </div>
        <span className="text-primary font-bold">
          {formatPrice(discountedPrice)}
        </span>
      </div>
    </div>
  );
}
