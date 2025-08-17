
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupAnalytics } from './utils/analytics';
import { setupCacheInvalidationListeners } from './utils/cacheInvalidation';

setupAnalytics();

// Setup cache invalidation listeners
setupCacheInvalidationListeners();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
