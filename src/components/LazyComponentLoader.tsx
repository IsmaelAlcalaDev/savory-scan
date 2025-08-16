
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentLoaderProps<T> {
  importFn: () => Promise<{ default: T }>;
  fallback?: React.ReactNode;
  delay?: number;
  children: (Component: T) => React.ReactNode;
}

export default function LazyComponentLoader<T extends React.ComponentType<any>>({
  importFn,
  fallback,
  delay = 0,
  children
}: LazyComponentLoaderProps<T>) {
  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const { default: Component } = await importFn();
        setComponent(Component);
      } catch (error) {
        console.error('Failed to load component:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [importFn, delay]);

  if (loading) {
    return fallback || (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!component) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error al cargar el componente
      </div>
    );
  }

  return <>{children(component)}</>;
}
