
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeoRestaurantResult {
  id: number;
  name: string;
  slug: string;
  description?: string;
  distance_km: number;
  similarity_score: number;
  google_rating?: number;
  google_rating_count?: number;
  price_range: string;
  cover_image_url?: string;
  logo_url?: string;
  cuisine_types: Array<{ name: string; slug: string }>;
  establishment_type?: string;
  services: string[];
  favorites_count: number;
}

interface UseGeoRestaurantSearchProps {
  query: string;
  userLat?: number;
  userLng?: number;
  maxDistance?: number;
  limit?: number;
}

/**
 * New hook for optimized restaurant search with geolocation
 * Uses the new search_restaurants RPC function
 */
export const useGeoRestaurantSearch = ({
  query,
  userLat,
  userLng,
  maxDistance = 50,
  limit = 20
}: UseGeoRestaurantSearchProps) => {
  const [results, setResults] = useState<GeoRestaurantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchRestaurants = async () => {
      // Only search if we have user coordinates
      if (!userLat || !userLng) {
        setResults([]);
        return;
      }

      // Allow empty query for location-based search
      if (query.length === 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('Optimized geo restaurant search for:', { query, userLat, userLng, maxDistance });

        const { data, error } = await supabase
          .rpc('search_restaurants', {
            search_query: query.trim(),
            user_lat: userLat,
            user_lon: userLng,
            max_results: limit,
            max_distance_km: maxDistance
          });

        if (error) {
          console.error('Error in optimized geo restaurant search:', error);
          throw error;
        }

        if (data && Array.isArray(data)) {
          const formattedResults: GeoRestaurantResult[] = data.map((item: any) => {
            // Parse cuisine_types JSON safely
            let cuisine_types: Array<{ name: string; slug: string }> = [];
            try {
              cuisine_types = Array.isArray(item.cuisine_types) 
                ? item.cuisine_types 
                : JSON.parse(item.cuisine_types || '[]');
            } catch (e) {
              cuisine_types = [];
            }

            // Parse services JSON safely
            let services: string[] = [];
            try {
              services = Array.isArray(item.services) 
                ? item.services 
                : JSON.parse(item.services || '[]');
            } catch (e) {
              services = [];
            }

            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              description: item.description,
              distance_km: parseFloat(item.distance_km),
              similarity_score: item.similarity_score || 0,
              google_rating: item.google_rating,
              google_rating_count: item.google_rating_count,
              price_range: item.price_range,
              cover_image_url: item.cover_image_url,
              logo_url: item.logo_url,
              cuisine_types,
              establishment_type: item.establishment_type,
              services,
              favorites_count: item.favorites_count || 0
            };
          });

          setResults(formattedResults);
          console.log('Optimized geo restaurant search results:', formattedResults.length, 'found');
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error in optimized geo restaurant search:', err);
        setError(err instanceof Error ? err.message : 'Error en búsqueda geolocalizada');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Use 300ms debounce for geo search as it's more complex
    const debounceTimer = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, userLat, userLng, maxDistance, limit]);

  return { results, loading, error };
};
