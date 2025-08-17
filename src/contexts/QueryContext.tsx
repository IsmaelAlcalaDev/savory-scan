
import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const QueryContext = createContext<QueryClient | undefined>(undefined);

export const useQueryClient = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQueryClient must be used within QueryProvider');
  }
  return context;
};

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </QueryContext.Provider>
  );
};
