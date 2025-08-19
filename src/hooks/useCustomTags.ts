
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomTag {
  tag: string;
  count: number;
}

export const useCustomTags = () => {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomTags = async () => {
      try {
        console.log('useCustomTags: Fetching custom tags from dishes');
        
        const { data, error: fetchError } = await supabase
          .from('dishes')
          .select('custom_tags')
          .eq('is_active', true)
          .not('custom_tags', 'is', null);

        if (fetchError) {
          console.error('useCustomTags: Error fetching dishes:', fetchError);
          throw fetchError;
        }

        // Process the custom_tags to get unique tags with counts
        const tagCounts: Record<string, number> = {};
        
        data?.forEach(dish => {
          if (dish.custom_tags && Array.isArray(dish.custom_tags)) {
            dish.custom_tags.forEach((tag: any) => {
              if (typeof tag === 'string' && tag.trim()) {
                const cleanTag = tag.trim();
                tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
              }
            });
          }
        });

        // Convert to array and sort by count (descending) then by name
        const tagsArray = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count;
            return a.tag.localeCompare(b.tag);
          });

        console.log('useCustomTags: Processed tags:', tagsArray);
        setCustomTags(tagsArray);
        setError(null);
      } catch (err) {
        console.error('useCustomTags: Error:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setCustomTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTags();
  }, []);

  return { customTags, loading, error };
};
