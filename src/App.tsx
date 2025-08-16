
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { DishFavoritesProvider } from "./contexts/DishFavoritesContext";
import { OrderSimulatorProvider } from "./contexts/OrderSimulatorContext";
import { useRoutePreload } from "./hooks/useRoutePreload";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LazyPageWrapper from "./components/LazyPageWrapper";

// Lazy imports
import { LazyRestaurantProfile } from "./components/lazy/LazyRestaurantProfile";
import { LazyRestaurantMenu } from "./components/lazy/LazyRestaurantMenu";
import { LazySecureAdminPanel } from "./components/lazy/LazySecureAdminPanel";
import { LazySuperAdminPanel } from "./components/lazy/LazySuperAdminPanel";
import { LazySecurityDashboard } from "./components/lazy/LazySecurityDashboard";

// Immediate imports for critical routes
import LocationEntry from "./pages/LocationEntry";
import Restaurants from "./pages/Restaurants";
import Dishes from "./pages/Dishes";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  useRoutePreload();

  return (
    <Routes>
      <Route path="/" element={<LocationEntry />} />
      <Route path="/restaurantes" element={<Restaurants />} />
      <Route path="/platos" element={<Dishes />} />
      <Route path="/restaurant/:slug" element={
        <LazyPageWrapper>
          <LazyRestaurantProfile />
        </LazyPageWrapper>
      } />
      <Route path="/carta/:slug" element={
        <LazyPageWrapper>
          <LazyRestaurantMenu />
        </LazyPageWrapper>
      } />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyPageWrapper>
              <LazySecureAdminPanel />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyPageWrapper>
              <LazySuperAdminPanel />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/security" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyPageWrapper>
              <LazySecurityDashboard />
            </LazyPageWrapper>
          </ProtectedRoute>
        } 
      />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  console.log('App: Starting application with enhanced performance and lazy loading');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FavoritesProvider>
              <DishFavoritesProvider>
                <OrderSimulatorProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AppRoutes />
                    </BrowserRouter>
                  </TooltipProvider>
                </OrderSimulatorProvider>
              </DishFavoritesProvider>
            </FavoritesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
