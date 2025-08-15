
import { useState } from 'react';
import DishCard from './DishCard';
import type { MenuSection } from '@/hooks/useRestaurantMenu';
import type { Promotion } from '@/hooks/usePromotions';

interface RestaurantMenuSectionProps {
  section: MenuSection;
  restaurantId: number;
  promotions: Promotion[];
  getPromotionForDish: (dishId: number, sectionId?: number) => Promotion | undefined;
  calculateDiscountedPrice: (originalPrice: number, promotion: Promotion) => number;
}

export default function RestaurantMenuSection({ 
  section, 
  restaurantId,
  promotions,
  getPromotionForDish,
  calculateDiscountedPrice
}: RestaurantMenuSectionProps) {
  const [expandedDishId, setExpandedDishId] = useState<number | null>(null);

  if (!section.dishes || section.dishes.length === 0) {
    return null;
  }

  return (
    <div id={`section-${section.id}`} className="w-full">
      {/* Top border line - more discrete */}
      <div className="border-t border-gray-100"></div>
      
      {/* Section header with custom gray background - full width */}
      <div style={{ backgroundColor: '#fafafa' }} className="px-4 py-4">
        <h2 className="text-xl font-bold text-foreground mb-1">
          {section.name}
        </h2>
        {section.description && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            {section.description}
          </p>
        )}
      </div>
      
      {/* Dishes container with white background - full width */}
      <div className="bg-white w-full">
        {section.dishes.map((dish, index) => (
          <DishCard
            key={dish.id}
            dish={dish}
            restaurantId={restaurantId}
            expandedDishId={expandedDishId}
            onExpandedChange={setExpandedDishId}
            isFirstInSection={index === 0}
            promotions={promotions}
            getPromotionForDish={getPromotionForDish}
            calculateDiscountedPrice={calculateDiscountedPrice}
          />
        ))}
      </div>
      
      {/* Bottom border line - more discrete */}
      <div className="border-b border-gray-100"></div>
    </div>
  );
}
