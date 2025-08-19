
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
        console.log('useCustomTags: Fetching custom tags from normalized tables');
        
        // Query the junction table to get tag counts
        const { data, error: fetchError } = await supabase
          .from('dish_custom_tags')
          .select(`
            restaurant_custom_tags(name)
          `);

        if (fetchError) {
          console.error('useCustomTags: Error fetching dish custom tags:', fetchError);
          throw fetchError;
        }

        // Process the custom_tags to get unique tags with counts
        const tagCounts: Record<string, number> = {};
        
        data?.forEach(dct => {
          const tagName = dct.restaurant_custom_tags?.name;
          if (tagName && typeof tagName === 'string' && tagName.trim()) {
            const cleanTag = tagName.trim();
            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
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
