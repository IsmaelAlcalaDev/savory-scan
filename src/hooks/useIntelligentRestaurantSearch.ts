
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RestaurantSearchResult {
  id: number;
  name: string;
  slug: string;
  description?: string;
  similarity_score: number;
}

export const useIntelligentRestaurantSearch = (query: string) => {
  const [results, setResults] = useState<RestaurantSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchRestaurants = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Optimized restaurant search for query:', query);

        // Use direct SQL query with trigram similarity until types are updated
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, slug, description')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('is_active', true)
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('favorites_count', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error in restaurant search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: RestaurantSearchResult[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            similarity_score: 0.5 // Placeholder until trigram is available
          }));

          setResults(formattedResults);
          console.log('Restaurant search results:', formattedResults);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in restaurant search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda de restaurantes');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchRestaurants, 200);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
