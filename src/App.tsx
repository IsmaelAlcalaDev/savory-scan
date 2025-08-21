
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
import AnalyticsProvider from "./components/AnalyticsProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import RestaurantProfile from "./pages/RestaurantProfile";
import RestaurantMenu from "./pages/RestaurantMenu";
import SecureAdminPanel from "./pages/SecureAdminPanel";
import SuperAdminPanel from "./pages/SuperAdminPanel";
import SecurityDashboard from "./pages/SecurityDashboard";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import LocationEntry from "./pages/LocationEntry";
import Restaurants from "./pages/Restaurants";
import Dishes from "./pages/Dishes";
import Account from "./pages/Account";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('App: Starting application with enhanced security and analytics');

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
                      <AnalyticsProvider>
                        <Routes>
                          <Route path="/" element={<LocationEntry />} />
                          <Route path="/restaurantes" element={<Restaurants />} />
                          <Route path="/platos" element={<Dishes />} />
                          <Route path="/account" element={<Account />} />
                          <Route path="/restaurant/:slug" element={<RestaurantProfile />} />
                          <Route path="/carta/:slug" element={<RestaurantMenu />} />
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
                           <Route 
                             path="/security" 
                             element={
                               <ProtectedRoute requiredRole="admin">
                                 <SecurityDashboard />
                               </ProtectedRoute>
                             } 
                           />
                           <Route 
                             path="/analytics" 
                             element={
                               <ProtectedRoute requiredRole="admin">
                                 <Analytics />
                               </ProtectedRoute>
                             } 
                           />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AnalyticsProvider>
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
