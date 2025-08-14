
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { DishFavoritesProvider } from "@/contexts/DishFavoritesContext";
import FoodieSpotLayout from "@/components/FoodieSpotLayout";
import Restaurants from "@/pages/Restaurants";
import RestaurantProfile from "@/pages/RestaurantProfile";
import RestaurantMenu from "@/pages/RestaurantMenu";
import Dishes from "@/pages/Dishes";
import LocationEntry from "@/pages/LocationEntry";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SecureAdminPanel from "@/pages/SecureAdminPanel";
import SuperAdminPanel from "@/pages/SuperAdminPanel";
import SecurityDashboard from "@/pages/SecurityDashboard";
import FoodieSpot from "@/pages/FoodieSpot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FavoritesProvider>
        <DishFavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/location" element={<LocationEntry />} />
                <Route path="/admin" element={<SecureAdminPanel />} />
                <Route path="/super-admin" element={<SuperAdminPanel />} />
                <Route path="/security" element={<SecurityDashboard />} />
                <Route path="/" element={<FoodieSpotLayout />}>
                  <Route index element={<FoodieSpot />} />
                  <Route path="restaurantes" element={<Restaurants />} />
                  <Route path="platos" element={<Dishes />} />
                  <Route path="restaurant/:slug" element={<RestaurantProfile />} />
                  <Route path="restaurant/:slug/menu" element={<RestaurantMenu />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DishFavoritesProvider>
      </FavoritesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
