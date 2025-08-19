
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureFlagValue {
  enabled: boolean;
}

// Type guard to check if the value is a valid feature flag
const isFeatureFlagValue = (value: any): value is FeatureFlagValue => {
  return value && typeof value === 'object' && typeof value.enabled === 'boolean';
};

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

        if (data?.value && isFeatureFlagValue(data.value)) {
          setEnabled(data.value.enabled === true);
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

        if (data?.value && isFeatureFlagValue(data.value)) {
          setEnabled(data.value.enabled === true);
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

// New restaurants RPC feed feature flag hook
export const useRestaurantsRpcFeed = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'FF_RESTAURANTES_RPC_FEED')
          .single();

        if (data?.value && isFeatureFlagValue(data.value)) {
          setEnabled(data.value.enabled === true);
        }
      } catch (error) {
        console.error('Error fetching FF_RESTAURANTES_RPC_FEED:', error);
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

        if (data?.value && isFeatureFlagValue(data.value)) {
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
