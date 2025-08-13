
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import LocationEntry from '@/pages/LocationEntry';
import Restaurants from '@/pages/Restaurants';
import RestaurantProfile from '@/pages/RestaurantProfile';
import RestaurantMenu from '@/pages/RestaurantMenu';
import Dishes from '@/pages/Dishes';
import FoodieSpot from '@/pages/FoodieSpot';
import Auth from '@/pages/Auth';
import SecurityDashboard from '@/pages/SecurityDashboard';
import SuperAdminPanel from '@/pages/SuperAdminPanel';
import SecureAdminPanel from '@/pages/SecureAdminPanel';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <AuthProvider>
              <FavoritesProvider>
                <Router>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<LocationEntry />} />
                      <Route path="/restaurantes" element={<Restaurants />} />
                      <Route path="/restaurant/:slug" element={<RestaurantProfile />} />
                      <Route path="/restaurant/:slug/menu" element={<RestaurantMenu />} />
                      <Route path="/platos" element={<Dishes />} />
                      <Route path="/foodie-spot" element={<FoodieSpot />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/security" element={<SecurityDashboard />} />
                      <Route path="/super-admin" element={<SuperAdminPanel />} />
                      <Route path="/admin" element={<SecureAdminPanel />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                </Router>
              </FavoritesProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
