
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DishPriceRange {
  id: number;
  name: string;
  display_text: string;
  min_price?: number | null;
  max_price?: number | null;
}

export const useDishPriceRanges = () => {
  const [priceRanges, setPriceRanges] = useState<DishPriceRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanges = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dish_price_ranges')
          .select('id, name, display_text, min_price, max_price')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setPriceRanges(data || []);
      } catch (e) {
        console.error('Error fetching dish price ranges:', e);
        setError(e instanceof Error ? e.message : 'Error al cargar rangos de precio de platos');
        setPriceRanges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanges();
  }, []);

  return { priceRanges, loading, error };
};
