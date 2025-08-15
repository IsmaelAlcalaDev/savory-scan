
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

        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .lte('valid_from', new Date().toISOString())
          .gte('valid_until', new Date().toISOString())
          .is('deleted_at', null);

        if (error) {
          throw error;
        }

        // Transform the data to match our interface
        const transformedData = (data || []).map(promo => ({
          ...promo,
          applicable_dishes: Array.isArray(promo.applicable_dishes) ? promo.applicable_dishes : [],
          applicable_sections: Array.isArray(promo.applicable_sections) ? promo.applicable_sections : []
        }));

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
    return promotions.find(promo => {
      if (promo.applies_to_entire_menu) return true;
      if (promo.applicable_dishes.includes(dishId)) return true;
      if (sectionId && promo.applicable_sections.includes(sectionId)) return true;
      return false;
    });
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
