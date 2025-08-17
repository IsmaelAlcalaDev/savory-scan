
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from '@/utils/serviceWorker';

// Register Service Worker for performance optimization
if (import.meta.env.PROD) {
  registerSW({
    onSuccess: (registration) => {
      console.log('✅ Service Worker registered successfully');
    },
    onUpdate: (registration) => {
      console.log('🔄 New Service Worker version available');
      // Could show a toast notification here
    },
    onError: (error) => {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
