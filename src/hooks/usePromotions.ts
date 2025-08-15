
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
          .lte('valid_from', now)
          .gte('valid_until', now)
          .is('deleted_at', null);

        console.log('usePromotions - query result:', { data, error });

        if (error) {
          throw error;
        }

        // Transform the data to match our interface
        const transformedData: Promotion[] = (data || []).map(promo => {
          console.log('usePromotions - processing promotion:', promo);
          console.log('usePromotions - applicable_dishes type:', typeof promo.applicable_dishes, 'value:', promo.applicable_dishes);
          console.log('usePromotions - applicable_sections type:', typeof promo.applicable_sections, 'value:', promo.applicable_sections);
          
          // Parse applicable_dishes - improved handling
          let applicableDishes: number[] = [];
          if (promo.applicable_dishes) {
            // If it's already an array, use it directly
            if (Array.isArray(promo.applicable_dishes)) {
              applicableDishes = promo.applicable_dishes.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
              console.log('usePromotions - applicable_dishes is array:', applicableDishes);
            } 
            // If it's a string, try to parse it as JSON
            else if (typeof promo.applicable_dishes === 'string') {
              try {
                const parsed = JSON.parse(promo.applicable_dishes);
                if (Array.isArray(parsed)) {
                  applicableDishes = parsed.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
                  console.log('usePromotions - parsed applicable_dishes string to array:', applicableDishes);
                }
              } catch (e) {
                console.error('usePromotions - Error parsing applicable_dishes string:', e);
                applicableDishes = [];
              }
            }
            // If it's some other type, try to handle it
            else {
              console.warn('usePromotions - unexpected applicable_dishes type:', typeof promo.applicable_dishes);
              applicableDishes = [];
            }
          }

          // Parse applicable_sections - improved handling
          let applicableSections: number[] = [];
          if (promo.applicable_sections) {
            // If it's already an array, use it directly
            if (Array.isArray(promo.applicable_sections)) {
              applicableSections = promo.applicable_sections.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
              console.log('usePromotions - applicable_sections is array:', applicableSections);
            } 
            // If it's a string, try to parse it as JSON
            else if (typeof promo.applicable_sections === 'string') {
              try {
                const parsed = JSON.parse(promo.applicable_sections);
                if (Array.isArray(parsed)) {
                  applicableSections = parsed.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
                  console.log('usePromotions - parsed applicable_sections string to array:', applicableSections);
                }
              } catch (e) {
                console.error('usePromotions - Error parsing applicable_sections string:', e);
                applicableSections = [];
              }
            }
            // If it's some other type, try to handle it
            else {
              console.warn('usePromotions - unexpected applicable_sections type:', typeof promo.applicable_sections);
              applicableSections = [];
            }
          }

          const transformedPromo = {
            id: promo.id,
            title: promo.title,
            description: promo.description,
            discount_type: promo.discount_type as 'percentage' | 'fixed' | 'two_for_one',
            discount_value: promo.discount_value,
            discount_label: promo.discount_label,
            valid_from: promo.valid_from,
            valid_until: promo.valid_until,
            applicable_dishes: applicableDishes,
            applicable_sections: applicableSections,
            applies_to_entire_menu: promo.applies_to_entire_menu || false,
            is_active: promo.is_active
          };

          console.log('usePromotions - transformed promotion:', transformedPromo);
          return transformedPromo;
        });

        console.log('usePromotions - final transformed promotions:', transformedData);
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
      console.log('getPromotionForDish - promotion applicable_dishes:', promo.applicable_dishes);
      console.log('getPromotionForDish - promotion applicable_sections:', promo.applicable_sections);
      console.log('getPromotionForDish - promotion applies_to_entire_menu:', promo.applies_to_entire_menu);
      
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
