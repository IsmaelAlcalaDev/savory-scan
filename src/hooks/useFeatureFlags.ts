
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlags {
  FF_HOME_RPC_FEED: boolean;
  // Otros feature flags existentes pueden ir aquí
}

const defaultFlags: FeatureFlags = {
  FF_HOME_RPC_FEED: false, // Por defecto desactivado
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('key, value')
          .eq('is_public', true)
          .in('key', Object.keys(defaultFlags));

        if (error) {
          console.error('Error fetching feature flags:', error);
          setFlags(defaultFlags);
        } else {
          const flagsFromDB = data?.reduce((acc, setting) => {
            if (setting.key in defaultFlags) {
              // Safely parse the JSON value
              let parsedValue = setting.value;
              if (typeof parsedValue === 'string') {
                try {
                  parsedValue = JSON.parse(parsedValue);
                } catch {
                  parsedValue = null;
                }
              }
              
              // Check if the parsed value has an enabled property
              if (parsedValue && typeof parsedValue === 'object' && 'enabled' in parsedValue) {
                acc[setting.key as keyof FeatureFlags] = Boolean(parsedValue.enabled);
              }
            }
            return acc;
          }, {} as Partial<FeatureFlags>) || {};

          setFlags({ ...defaultFlags, ...flagsFromDB });
        }
      } catch (err) {
        console.error('Error in feature flags fetch:', err);
        setFlags(defaultFlags);
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  return { flags, loading };
};

// Hook específico para el flag del home RPC feed
export const useHomeRpcFeed = () => {
  const { flags, loading } = useFeatureFlags();
  return { enabled: flags.FF_HOME_RPC_FEED, loading };
};
