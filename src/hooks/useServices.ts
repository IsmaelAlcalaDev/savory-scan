
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching services...');
        
        const { data, error: fetchError } = await supabase
          .from('services')
          .select('id, name, slug, icon')
          .order('name');

        if (fetchError) {
          console.error('Supabase error fetching services:', fetchError);
          setError('Error al cargar servicios');
          setServices([]);
          return;
        }
        
        console.log('Raw services data:', data);
        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Error al cargar servicios');
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};
