
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationSuggestion {
  id: number;
  name: string;
  type: 'city' | 'municipality' | 'district' | 'poi';
  latitude: number;
  longitude: number;
  parent?: string;
  description?: string;
  is_famous?: boolean;
}

export const useLocationSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchLocations = async () => {
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching locations for query:', query);

        // Use the intelligent location search RPC for better performance
        const { data, error } = await supabase
          .rpc('intelligent_location_search', {
            search_query: query.trim(),
            search_limit: 8
          });

        if (error) {
          console.error('Error in location search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type as 'city' | 'municipality' | 'district' | 'poi',
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            parent: item.parent || undefined,
            description: item.description || undefined,
            is_famous: item.is_famous || false
          }));

          setSuggestions(formattedSuggestions);
          console.log('Location search results:', formattedSuggestions.length, 'found');
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error searching locations:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Optimal debounce for location search
    const debounceTimer = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { suggestions, loading };
};
