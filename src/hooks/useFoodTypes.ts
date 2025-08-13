
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  icon_url?: string;
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
        console.log('useFoodTypes: Fetching food types from database');
        
        const { data, error } = await supabase
          .from('food_types')
          .select('id, name, slug, icon, icon_url, is_active, display_order')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          console.error('useFoodTypes: Error fetching food types:', error);
          setError(error.message);
          return;
        }

        console.log('useFoodTypes: Successfully fetched food types:', data?.length || 0);
        setFoodTypes(data || []);
      } catch (err) {
        console.error('useFoodTypes: Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodTypes();
  }, []);

  return { foodTypes, loading, error };
};
