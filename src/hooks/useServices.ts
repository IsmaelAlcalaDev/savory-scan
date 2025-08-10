
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  icon_url?: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('Fetching services...');
        
        const { data, error } = await supabase
          .from('services')
          .select('id, name, slug, icon, icon_url')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Supabase error fetching services:', error);
          throw error;
        }
        
        console.log('Raw services data:', data);
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};
