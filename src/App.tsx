
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const FoodieSpot = lazy(() => import("@/pages/FoodieSpot"));
const RestaurantProfile = lazy(() => import("@/pages/RestaurantProfile"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SecureAdminPanel = lazy(() => import("@/pages/SecureAdminPanel"));
const SuperAdminPanel = lazy(() => import("@/pages/SuperAdminPanel"));

const queryClient = new QueryClient();

const App = () => (
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
                  <Route 
                    path="/" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <FoodieSpot />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/restaurant/:slug" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <RestaurantProfile />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/carta/:slug" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <RestaurantProfile />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/auth" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Auth />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <SecureAdminPanel />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="/super-admin" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <SuperAdminPanel />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="*" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <NotFound />
                      </Suspense>
                    } 
                  />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
