
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/shared/contexts/AuthContext";
import { FavoritesProvider } from "@/shared/contexts/FavoritesContext";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import RestaurantProfile from "@/apps/client/pages/RestaurantProfile";
import NotFound from "@/apps/client/pages/NotFound";
import Auth from "@/apps/client/pages/Auth";
import LocationEntry from "@/apps/client/pages/LocationEntry";
import Restaurants from "@/apps/client/pages/Restaurants";
import Dishes from "@/apps/client/pages/Dishes";
import RestaurantMenu from "@/apps/client/pages/RestaurantMenu";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const ClientApp = () => {
  console.log('ClientApp: Starting client application');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FavoritesProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<LocationEntry />} />
                    <Route path="/restaurantes" element={<Restaurants />} />
                    <Route path="/platos" element={<Dishes />} />
                    <Route path="/restaurant/:slug" element={<RestaurantProfile />} />
                    <Route path="/restaurant/:slug/menu" element={<RestaurantMenu />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </FavoritesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default ClientApp;
