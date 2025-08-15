
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'two_for_one';
  discount_value: number;
  discount_label: string;
  valid_from: string;
  valid_until: string;
  applicable_dishes: number[];
  applicable_sections: number[];
  applies_to_entire_menu: boolean;
  is_active: boolean;
}

export const usePromotions = (restaurantId: number) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('usePromotions - fetching for restaurant:', restaurantId);
        const now = new Date().toISOString();
        console.log('usePromotions - current time:', now);

        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .lte('valid_from', now)  // valid_from debe ser menor o igual que ahora
          .gte('valid_until', now) // valid_until debe ser mayor o igual que ahora
          .is('deleted_at', null);

        console.log('usePromotions - query result:', { data, error });

        if (error) {
          throw error;
        }

        // Transform the data to match our interface
        const transformedData: Promotion[] = (data || []).map(promo => {
          console.log('usePromotions - processing promotion:', promo);
          return {
            id: promo.id,
            title: promo.title,
            description: promo.description,
            discount_type: promo.discount_type as 'percentage' | 'fixed' | 'two_for_one',
            discount_value: promo.discount_value,
            discount_label: promo.discount_label,
            valid_from: promo.valid_from,
            valid_until: promo.valid_until,
            applicable_dishes: Array.isArray(promo.applicable_dishes) 
              ? (promo.applicable_dishes as any[]).map(id => Number(id)).filter(id => !isNaN(id))
              : [],
            applicable_sections: Array.isArray(promo.applicable_sections) 
              ? (promo.applicable_sections as any[]).map(id => Number(id)).filter(id => !isNaN(id))
              : [],
            applies_to_entire_menu: promo.applies_to_entire_menu || false,
            is_active: promo.is_active
          };
        });

        console.log('usePromotions - transformed promotions:', transformedData);
        setPromotions(transformedData);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar promociones');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [restaurantId]);

  const getPromotionForDish = (dishId: number, sectionId?: number) => {
    console.log('getPromotionForDish - checking dish:', dishId, 'section:', sectionId);
    console.log('getPromotionForDish - available promotions:', promotions);
    
    const promotion = promotions.find(promo => {
      console.log('getPromotionForDish - checking promotion:', promo);
      if (promo.applies_to_entire_menu) {
        console.log('getPromotionForDish - applies to entire menu');
        return true;
      }
      if (promo.applicable_dishes.includes(dishId)) {
        console.log('getPromotionForDish - found in applicable dishes');
        return true;
      }
      if (sectionId && promo.applicable_sections.includes(sectionId)) {
        console.log('getPromotionForDish - found in applicable sections');
        return true;
      }
      return false;
    });
    
    console.log('getPromotionForDish - result:', promotion);
    return promotion;
  };

  const calculateDiscountedPrice = (originalPrice: number, promotion: Promotion) => {
    if (promotion.discount_type === 'percentage') {
      return originalPrice * (1 - promotion.discount_value / 100);
    } else if (promotion.discount_type === 'fixed') {
      return Math.max(0, originalPrice - promotion.discount_value);
    } else if (promotion.discount_type === 'two_for_one') {
      // For two_for_one, we could show half price or handle it differently
      return originalPrice * 0.5;
    }
    return originalPrice;
  };

  return { 
    promotions, 
    loading, 
    error, 
    getPromotionForDish, 
    calculateDiscountedPrice 
  };
};
