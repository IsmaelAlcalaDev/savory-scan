
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlagValue {
  enabled: boolean;
}

export const useRestaurantFeedRpc = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'FF_HOME_RPC_FEED')
          .single();

        if (data?.value) {
          const flagValue = data.value as FeatureFlagValue;
          setEnabled(flagValue.enabled === true);
        }
      } catch (error) {
        console.error('Error fetching FF_HOME_RPC_FEED:', error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlag();
  }, []);

  return { enabled, loading };
};

// Home RPC feed feature flag hook
export const useHomeRpcFeed = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'FF_HOME_RPC_FEED')
          .single();

        if (data?.value) {
          const flagValue = data.value as FeatureFlagValue;
          setEnabled(flagValue.enabled === true);
        }
      } catch (error) {
        console.error('Error fetching FF_HOME_RPC_FEED:', error);
        setEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureFlag();
  }, []);

  return { enabled, loading };
};

// New audit feature flag hook
export const useRestaurantsAuditRpc = () => {
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
          const flagValue = data.value as FeatureFlagValue;
          setEnabled(flagValue.enabled === true);
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
