
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrigramSearchOptions {
  query: string;
  limit?: number;
  minSimilarity?: number;
}

interface TrigramResult {
  id: number;
  name: string;
  slug: string;
  similarity_score: number;
}

/**
 * Hook optimizado para búsqueda trigram ultrarrápida
 * Ideal para autocompletado con <50ms
 */
export const useOptimizedTrigram = ({ 
  query, 
  limit = 10, 
  minSimilarity = 0.1 
}: TrigramSearchOptions) => {
  const [results, setResults] = useState<TrigramResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number>(0);

  useEffect(() => {
    const searchWithTrigram = async () => {
      if (!query || query.length < 1) {
        setResults([]);
        setSearchTime(0);
        return;
      }

      setLoading(true);
      setError(null);
      
      const startTime = performance.now();

      try {
        console.log('Optimized trigram search starting for:', query);

        const { data, error } = await supabase
          .rpc('fast_restaurant_autocomplete', {
            search_query: query.trim(),
            max_results: limit
          });

        const endTime = performance.now();
        const duration = endTime - startTime;
        setSearchTime(duration);

        if (error) {
          console.error('Trigram search error:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          // Filter by minimum similarity threshold
          const filteredResults = data
            .filter((item: any) => (item.similarity_score || 0) >= minSimilarity)
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              similarity_score: item.similarity_score || 0
            }));

          setResults(filteredResults);
          console.log(`Trigram search completed in ${duration.toFixed(2)}ms, found ${filteredResults.length} results`);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Trigram search failed:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda trigram');
        setResults([]);
        setSearchTime(performance.now() - startTime);
      } finally {
        setLoading(false);
      }
    };

    // Minimal debounce for ultra-fast trigram search
    const debounceTimer = setTimeout(searchWithTrigram, 25);
    return () => clearTimeout(debounceTimer);
  }, [query, limit, minSimilarity]);

  return { 
    results, 
    loading, 
    error, 
    searchTime,
    isUltraFast: searchTime > 0 && searchTime < 50 
  };
};
