import { useState, useEffect } from 'react';

interface FeatureFlags {
  FF_IMPROVE_HOME_PERFORMANCE: boolean;
  FF_NEW_FAVORITES_LOGIC: boolean;
  FF_OPTIMIZE_RESTAURANT_DIET_STATS: boolean;
  FF_HOME_RPC_FEED: boolean;
}

const defaultFlags: FeatureFlags = {
  FF_IMPROVE_HOME_PERFORMANCE: true,
  FF_NEW_FAVORITES_LOGIC: true,
  FF_OPTIMIZE_RESTAURANT_DIET_STATS: true,
  FF_HOME_RPC_FEED: false, // Disabled by default for gradual rollout
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    // Here you could fetch flags from a remote source
    // For now, we just use the default flags
    setFlags(defaultFlags);
  }, []);

  return { flags };
};
