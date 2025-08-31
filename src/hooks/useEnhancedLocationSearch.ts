
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationOption {
  id: number;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'neighborhood' | 'postal_code' | 'poi';
  latitude: number;
  longitude: number;
  parent?: string;
  description?: string;
  is_famous?: boolean;
  postal_code?: string;
  similarity_score?: number;
}

export const useEnhancedLocationSearch = (query: string) => {
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchLocations = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      
      try {
        console.log('Enhanced location search for:', query);

        // Use the intelligent location search with better parameters
        const { data, error } = await supabase
          .rpc('intelligent_location_search', {
            search_query: query.trim(),
            search_limit: 12
          });

        if (error) {
          console.error('Error in enhanced location search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedSuggestions: LocationOption[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type as LocationOption['type'],
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            parent: item.parent || undefined,
            description: item.description || undefined,
            is_famous: item.is_famous || false,
            postal_code: item.postal_code || undefined,
            similarity_score: item.similarity_score || 0
          }));

          setSuggestions(formattedSuggestions);
          console.log('Enhanced search results:', formattedSuggestions.length, 'found');
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error in enhanced location search:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Optimal debounce for better UX
    const debounceTimer = setTimeout(searchLocations, 250);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { suggestions, loading, hasSearched };
};
