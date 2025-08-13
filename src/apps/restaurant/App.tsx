
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/shared/contexts/AuthContext";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import RestaurantDashboard from "@/apps/restaurant/pages/RestaurantDashboard";
import RestaurantMenu from "@/apps/restaurant/pages/RestaurantMenu";
import RestaurantOrders from "@/apps/restaurant/pages/RestaurantOrders";
import RestaurantSettings from "@/apps/restaurant/pages/RestaurantSettings";
import RestaurantAuth from "@/apps/restaurant/pages/RestaurantAuth";
import NotFound from "@/apps/restaurant/pages/NotFound";
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

const RestaurantApp = () => {
  console.log('RestaurantApp: Starting restaurant application');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename="/restaurant-panel">
                <Routes>
                  <Route path="/auth" element={<RestaurantAuth />} />
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute requiredRole="moderator">
                        <RestaurantDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/menu" 
                    element={
                      <ProtectedRoute requiredRole="moderator">
                        <RestaurantMenu />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute requiredRole="moderator">
                        <RestaurantOrders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute requiredRole="moderator">
                        <RestaurantSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default RestaurantApp;
