
import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyPageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const defaultFallback = (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function LazyPageWrapper({ children, fallback = defaultFallback }: LazyPageWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
