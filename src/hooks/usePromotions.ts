
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

        // Fixed date comparison logic:
        // - valid_from <= now (promotion has started)
        // - valid_until > now (promotion hasn't expired)
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .lte('valid_from', now)
          .gt('valid_until', now)
          .is('deleted_at', null);

        console.log('usePromotions - query executed with filters:');
        console.log('  - restaurant_id:', restaurantId);
        console.log('  - is_active: true');
        console.log('  - valid_from <= ', now);
        console.log('  - valid_until > ', now);
        console.log('  - deleted_at IS NULL');
        console.log('usePromotions - raw query result:', { data, error });

        if (error) {
          console.error('usePromotions - Supabase query error:', error);
          throw error;
        }

        console.log('usePromotions - found', data?.length || 0, 'promotions');

        // Transform the data to match our interface
        const transformedData: Promotion[] = (data || []).map((promo, index) => {
          console.log(`usePromotions - processing promotion ${index + 1}:`, promo);
          console.log(`usePromotions - promotion ${promo.id} details:`);
          console.log('  - title:', promo.title);
          console.log('  - valid_from:', promo.valid_from);
          console.log('  - valid_until:', promo.valid_until);
          console.log('  - applicable_dishes (raw):', promo.applicable_dishes, 'type:', typeof promo.applicable_dishes);
          console.log('  - applicable_sections (raw):', promo.applicable_sections, 'type:', typeof promo.applicable_sections);
          
          // Handle applicable_dishes - improved logic
          let applicableDishes: number[] = [];
          if (promo.applicable_dishes) {
            if (Array.isArray(promo.applicable_dishes)) {
              // Already an array - use directly
              applicableDishes = promo.applicable_dishes.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
              console.log('  - applicable_dishes is array, converted to:', applicableDishes);
            } else if (typeof promo.applicable_dishes === 'string') {
              // String - try to parse as JSON
              try {
                const parsed = JSON.parse(promo.applicable_dishes);
                if (Array.isArray(parsed)) {
                  applicableDishes = parsed.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
                  console.log('  - applicable_dishes parsed from string to:', applicableDishes);
                } else {
                  console.warn('  - applicable_dishes string parsed but not an array:', parsed);
                }
              } catch (e) {
                console.error('  - Error parsing applicable_dishes string:', e);
              }
            } else {
              console.warn('  - unexpected applicable_dishes type:', typeof promo.applicable_dishes, promo.applicable_dishes);
            }
          }

          // Handle applicable_sections - improved logic
          let applicableSections: number[] = [];
          if (promo.applicable_sections) {
            if (Array.isArray(promo.applicable_sections)) {
              // Already an array - use directly
              applicableSections = promo.applicable_sections.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
              console.log('  - applicable_sections is array, converted to:', applicableSections);
            } else if (typeof promo.applicable_sections === 'string') {
              // String - try to parse as JSON
              try {
                const parsed = JSON.parse(promo.applicable_sections);
                if (Array.isArray(parsed)) {
                  applicableSections = parsed.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
                  console.log('  - applicable_sections parsed from string to:', applicableSections);
                } else {
                  console.warn('  - applicable_sections string parsed but not an array:', parsed);
                }
              } catch (e) {
                console.error('  - Error parsing applicable_sections string:', e);
              }
            } else {
              console.warn('  - unexpected applicable_sections type:', typeof promo.applicable_sections, promo.applicable_sections);
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

          console.log(`usePromotions - promotion ${promo.id} transformed:`, transformedPromo);
          return transformedPromo;
        });

        console.log('usePromotions - final transformed promotions:', transformedData);
        setPromotions(transformedData);
      } catch (err) {
        console.error('usePromotions - Error in fetchPromotions:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar promociones');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [restaurantId]);

  const getPromotionForDish = (dishId: number, sectionId?: number) => {
    console.log('getPromotionForDish - checking for dish:', dishId, 'section:', sectionId);
    console.log('getPromotionForDish - available promotions count:', promotions.length);
    
    const promotion = promotions.find((promo, index) => {
      console.log(`getPromotionForDish - checking promotion ${index + 1} (ID: ${promo.id}):`);
      console.log('  - title:', promo.title);
      console.log('  - applies_to_entire_menu:', promo.applies_to_entire_menu);
      console.log('  - applicable_dishes:', promo.applicable_dishes);
      console.log('  - applicable_sections:', promo.applicable_sections);
      
      if (promo.applies_to_entire_menu) {
        console.log('  - ✅ applies to entire menu - MATCH');
        return true;
      }
      
      if (promo.applicable_dishes.includes(dishId)) {
        console.log('  - ✅ dish', dishId, 'found in applicable_dishes - MATCH');
        return true;
      }
      
      if (sectionId && promo.applicable_sections.includes(sectionId)) {
        console.log('  - ✅ section', sectionId, 'found in applicable_sections - MATCH');
        return true;
      }
      
      console.log('  - ❌ no match');
      return false;
    });
    
    console.log('getPromotionForDish - final result:', promotion ? `Found promotion: ${promotion.title}` : 'No promotion found');
    return promotion;
  };

  const calculateDiscountedPrice = (originalPrice: number, promotion: Promotion) => {
    console.log('calculateDiscountedPrice - calculating for price:', originalPrice, 'promotion:', promotion.title);
    
    let discountedPrice = originalPrice;
    
    if (promotion.discount_type === 'percentage') {
      discountedPrice = originalPrice * (1 - promotion.discount_value / 100);
      console.log('  - percentage discount:', promotion.discount_value + '%', 'result:', discountedPrice);
    } else if (promotion.discount_type === 'fixed') {
      discountedPrice = Math.max(0, originalPrice - promotion.discount_value);
      console.log('  - fixed discount:', promotion.discount_value, 'result:', discountedPrice);
    } else if (promotion.discount_type === 'two_for_one') {
      discountedPrice = originalPrice * 0.5;
      console.log('  - two for one discount, result:', discountedPrice);
    }
    
    return discountedPrice;
  };

  return { 
    promotions, 
    loading, 
    error, 
    getPromotionForDish, 
    calculateDiscountedPrice 
  };
};
