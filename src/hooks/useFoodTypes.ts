
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  icon_url?: string;
  icon_emoji?: string;
  is_active: boolean;
  display_order: number;
}

export const useFoodTypes = () => {
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoodTypes = async () => {
      try {
        console.log('Fetching food types...');
        
        const { data, error } = await supabase
          .from('food_types')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
          .order('name');

        if (error) {
          console.error('Error fetching food types:', error);
          throw error;
        }

        console.log('Food types fetched:', data);
        setFoodTypes(data || []);
      } catch (err) {
        console.error('Error in useFoodTypes:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de comida');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodTypes();
  }, []);

  return { foodTypes, loading, error };
};
