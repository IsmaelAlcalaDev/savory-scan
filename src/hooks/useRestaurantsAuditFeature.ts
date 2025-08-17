
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRestaurantsAuditFeature = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'FF_RESTAURANTES_RPC')
          .single();

        if (data?.value) {
          setEnabled(data.value.enabled === true);
        }
      } catch (error) {
        console.error('Error fetching FF_RESTAURANTES_RPC:', error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlag();
  }, []);

  return { enabled, loading };
};
