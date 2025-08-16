
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomTag {
  name: string;
  count: number;
}

export const useCustomTags = () => {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        setLoading(true);
        
        // Get all dishes with their custom_tags
        const { data: dishes, error: dishesError } = await supabase
          .from('dishes')
          .select('custom_tags')
          .eq('is_active', true)
          .is('deleted_at', null)
          .not('custom_tags', 'eq', '[]');

        if (dishesError) {
          throw dishesError;
        }

        // Extract and count unique custom tags
        const tagCounts: Record<string, number> = {};
        
        dishes?.forEach(dish => {
          if (dish.custom_tags && Array.isArray(dish.custom_tags)) {
            dish.custom_tags.forEach((tag: string) => {
              if (tag && typeof tag === 'string') {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
            });
          }
        });

        // Convert to array and sort by count (descending) then by name
        const tagsArray = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.name.localeCompare(b.name);
          });

        setCustomTags(tagsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching custom tags:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar etiquetas');
        setCustomTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTags();
  }, []);

  return { customTags, loading, error };
};
