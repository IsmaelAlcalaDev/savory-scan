
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
        console.info('Fetching dish price ranges from price_ranges...');
        
        const { data, error } = await supabase
          .from('price_ranges')
          .select('id, name, display_text, min_price, max_price, is_active, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .returns<Array<{
            id: number;
            name: string;
            display_text: string;
            min_price: number | null;
            max_price: number | null;
            is_active: boolean;
            display_order: number;
          }>>();

        if (error) throw error;

        const mapped: DishPriceRange[] = (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          display_text: r.display_text,
          min_price: r.min_price,
          max_price: r.max_price,
        }));

        setPriceRanges(mapped);
        console.info('Dish price ranges loaded:', mapped);
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
