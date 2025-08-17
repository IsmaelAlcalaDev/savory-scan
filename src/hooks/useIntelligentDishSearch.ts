
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DishSearchResult {
  id: number;
  name: string;
  description?: string;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  base_price: number;
  image_url?: string;
  category_name?: string;
  similarity_score: number;
}

export const useIntelligentDishSearch = (query: string) => {
  const [results, setResults] = useState<DishSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchDishes = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Fulltext tsvector dish search for query:', query);

        // Prepare query for tsvector search - convert spaces to & for AND search
        const tsQuery = query.trim().split(/\s+/).join(' & ');

        // Use the new tsvector-optimized RPC function
        const { data, error } = await supabase
          .rpc('search_dishes_fulltext', {
            search_query: tsQuery,
            max_results: 30
          });

        if (error) {
          console.error('Error in fulltext dish search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: DishSearchResult[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            restaurant_id: item.restaurant_id,
            restaurant_name: item.restaurant_name,
            restaurant_slug: item.restaurant_slug,
            base_price: item.base_price,
            image_url: item.image_url,
            category_name: item.category_name,
            similarity_score: item.ts_rank || 0
          }));

          setResults(formattedResults);
          console.log('Fulltext dish search results:', formattedResults.length, 'found');
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in fulltext dish search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda de platos');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Reduced debounce time since tsvector search is much faster
    const debounceTimer = setTimeout(searchDishes, 100);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { results, loading, error };
};
