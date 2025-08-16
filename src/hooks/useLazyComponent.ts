
import { useState, useEffect } from 'react';

interface UseLazyComponentOptions {
  preload?: boolean;
  delay?: number;
}

export const useLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  options: UseLazyComponentOptions = {}
) => {
  const { preload = false, delay = 0 } = options;
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = async () => {
    if (component || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const { default: Component } = await importFn();
      setComponent(Component);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preload) {
      loadComponent();
    }
  }, [preload]);

  return { component, loading, error, loadComponent };
};
