
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { DishFavoritesProvider } from "./contexts/DishFavoritesContext";
import Index from "./pages/Index";
import Restaurants from "./pages/Restaurants";
import RestaurantProfile from "./pages/RestaurantProfile";
import RestaurantMenu from "./pages/RestaurantMenu";
import Dishes from "./pages/Dishes";
import LocationEntry from "./pages/LocationEntry";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FoodieSpot from "./pages/FoodieSpot";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <FavoritesProvider>
                <DishFavoritesProvider>
                  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/restaurantes" element={<Restaurants />} />
                      <Route path="/restaurante/:slug" element={<RestaurantProfile />} />
                      <Route path="/restaurante/:slug/carta" element={<RestaurantMenu />} />
                      <Route path="/platos" element={<Dishes />} />
                      <Route path="/ubicacion" element={<LocationEntry />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/foodie-spot" element={<FoodieSpot />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <Toaster />
                  <Sonner />
                </DishFavoritesProvider>
              </FavoritesProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
