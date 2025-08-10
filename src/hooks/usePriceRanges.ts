
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PriceRange {
  id: number;
  name: string;
  display_text: string;
  value: string;
  min_price?: number;
  max_price?: number;
  icon?: string;
}

export const usePriceRanges = () => {
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceRanges = async () => {
      try {
        setLoading(true);
        console.log('Fetching price ranges...');
        
        const { data, error: fetchError } = await supabase
          .from('price_ranges')
          .select('id, name, display_text, value, min_price, max_price, icon')
          .eq('is_active', true)
          .order('display_order');

        if (fetchError) {
          console.error('Supabase error fetching price ranges:', fetchError);
          setError('Error al cargar rangos de precio');
          setPriceRanges([]);
          return;
        }
        
        console.log('Raw price ranges data:', data);
        setPriceRanges(data || []);
      } catch (err) {
        console.error('Error fetching price ranges:', err);
        setError('Error al cargar rangos de precio');
        setPriceRanges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRanges();
  }, []);

  return { priceRanges, loading, error };
};
