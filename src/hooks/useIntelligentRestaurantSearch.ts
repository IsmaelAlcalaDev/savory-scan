
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
        console.log('Intelligent trigram restaurant search for query:', query);

        // Use the new trigram-optimized RPC function for restaurant search
        const { data, error } = await supabase
          .rpc('fast_restaurant_autocomplete', {
            search_query: query.trim(),
            max_results: 20
          });

        if (error) {
          console.error('Error in intelligent restaurant search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: RestaurantSearchResult[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: '', // RPC function doesn't return description for performance
            similarity_score: item.similarity_score || 0
          }));

          setResults(formattedResults);
          console.log('Intelligent restaurant search results:', formattedResults.length, 'found');
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in intelligent restaurant search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda de restaurantes');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Reduced debounce time since trigram search is much faster
    const debounceTimer = setTimeout(searchRestaurants, 100);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
