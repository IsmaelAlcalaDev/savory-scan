
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CustomTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  restaurant_id: number;
  dish_count?: number;
}

export const useCustomTags = (restaurantId?: number) => {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        setLoading(true);
        console.log('Fetching custom tags for restaurant:', restaurantId);
        
        let query = supabase
          .from('restaurant_custom_tags')
          .select('*');

        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error: fetchError } = await query.order('name');

        if (fetchError) {
          console.error('Supabase error fetching custom tags:', fetchError);
          setError('Error al cargar tags');
          return;
        }
        
        console.log('Raw custom tags data:', data);
        
        const formattedTags = (data || []).map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          restaurant_id: tag.restaurant_id
        }));

        setCustomTags(formattedTags);
      } catch (err) {
        console.error('Error fetching custom tags:', err);
        setError('Error al cargar tags');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTags();
  }, [restaurantId]);

  return { customTags, loading, error };
};
