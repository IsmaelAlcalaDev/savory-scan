
import "./App.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { DishFavoritesProvider } from "./contexts/DishFavoritesContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AnalyticsProvider } from "./components/AnalyticsProvider";

// Pages
import FoodieSpot from "./pages/FoodieSpot";
import Restaurants from "./pages/Restaurants";
import Dishes from "./pages/Dishes";
import RestaurantProfile from "./pages/RestaurantProfile";
import RestaurantMenu from "./pages/RestaurantMenu";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import LocationEntry from "./pages/LocationEntry";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import SecureAdminPanel from "./pages/SecureAdminPanel";
import SecurityDashboard from "./pages/SecurityDashboard";
import NotFound from "./pages/NotFound";

// ✅ Optimized ReactQuery configuration for caching system
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Longer stale times to work better with our Redis cache
      staleTime: 2 * 60 * 1000, // 2 minutes (longer than Redis TTL)
      gcTime: 5 * 60 * 1000, // 5 minutes
      // Reduce network requests when cache is fresh
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry if it's a client error (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      // Cache mutations for better UX
      retry: 1,
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FavoritesProvider>
              <DishFavoritesProvider>
                <AnalyticsProvider>
                  <TooltipProvider>
                    <BrowserRouter>
                      <div className="min-h-screen bg-background font-sans antialiased">
                        <Routes>
                          <Route path="/" element={<FoodieSpot />} />
                          <Route path="/restaurantes" element={<Restaurants />} />
                          <Route path="/platos" element={<Dishes />} />
                          <Route path="/restaurante/:slug" element={<RestaurantProfile />} />
                          <Route path="/restaurante/:slug/menu" element={<RestaurantMenu />} />
                          <Route path="/cuenta" element={<Account />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/ubicacion" element={<LocationEntry />} />
                          <Route path="/admin/super" element={<SuperAdminPanel />} />
                          <Route path="/admin/secure" element={<SecureAdminPanel />} />
                          <Route path="/seguridad" element={<SecurityDashboard />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                      <Toaster />
                      <Sonner />
                    </BrowserRouter>
                  </TooltipProvider>
                </AnalyticsProvider>
              </DishFavoritesProvider>
            </FavoritesProvider>
          </AuthProvider>
          {/* ✅ Only show React Query Devtools in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
