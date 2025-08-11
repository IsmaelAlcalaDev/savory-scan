
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RestaurantProfile from "./pages/RestaurantProfile";
import SecureAdminPanel from "./pages/SecureAdminPanel";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import FoodieSpot from "./pages/FoodieSpot";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  console.log('App: Starting application');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <FavoritesProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ErrorBoundary>
                        <Routes>
                          <Route path="/" element={<FoodieSpot />} />
                          <Route path="/restaurant/:slug" element={<RestaurantProfile />} />
                          <Route 
                            path="/admin" 
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <SecureAdminPanel />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/superadmin" 
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <SuperAdminPanel />
                              </ProtectedRoute>
                            } 
                          />
                          <Route path="/auth" element={<Auth />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </ErrorBoundary>
                    </BrowserRouter>
                  </TooltipProvider>
                </FavoritesProvider>
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
