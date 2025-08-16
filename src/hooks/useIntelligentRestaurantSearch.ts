
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
        console.log('Intelligent restaurant search for query:', query);

        // Usar la función de búsqueda inteligente
        const { data, error } = await supabase
          .rpc('intelligent_restaurant_search' as any, {
            search_query: query,
            search_limit: 20
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
            description: item.description,
            similarity_score: item.similarity_score || 0
          }));

          setResults(formattedResults);
          console.log('Intelligent restaurant search results:', formattedResults);
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

    const debounceTimer = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
