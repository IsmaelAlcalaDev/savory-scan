
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EstablishmentType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  icon_url?: string;
}

export const useEstablishmentTypes = () => {
  const [establishmentTypes, setEstablishmentTypes] = useState<EstablishmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstablishmentTypes = async () => {
      try {
        setLoading(true);
        console.log('Fetching establishment types...');
        
        const { data, error } = await supabase
          .from('establishment_types')
          .select('id, name, slug, icon, icon_url')
          .order('name');

        if (error) {
          console.error('Supabase error fetching establishment types:', error);
          throw error;
        }
        
        console.log('Raw establishment types data:', data);
        setEstablishmentTypes(data || []);
      } catch (err) {
        console.error('Error fetching establishment types:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar tipos de establecimiento');
      } finally {
        setLoading(false);
      }
    };

    fetchEstablishmentTypes();
  }, []);

  return { establishmentTypes, loading, error };
};
