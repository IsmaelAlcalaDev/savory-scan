
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  population?: number;
}

export const useCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('cities')
          .select('id, name, latitude, longitude, population')
          .order('population', { ascending: false })
          .limit(20);

        if (error) throw error;
        setCities(data || []);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar ciudades');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading, error };
};
