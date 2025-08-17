
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { setupAnalytics } from './utils/analytics';
import { setupCacheInvalidationListeners } from './utils/cacheInvalidation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds
    },
  },
});

setupAnalytics();

// Setup cache invalidation listeners
setupCacheInvalidationListeners();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
