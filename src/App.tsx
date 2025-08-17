import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { DishFavoritesProvider } from "@/contexts/DishFavoritesContext";
import { OrderSimulatorProvider } from "@/contexts/OrderSimulatorContext";
import BroadcastFavoritesWrapper from "@/components/BroadcastFavoritesWrapper";
import LandingPage from "@/pages/LandingPage";
import RestaurantPage from "@/pages/RestaurantPage";
import SearchPage from "@/pages/SearchPage";
import ProfilePage from "@/pages/ProfilePage";
import FavoritesPage from "@/pages/FavoritesPage";
import OrdersPage from "@/pages/OrdersPage";
import SecurityAuditLog from "@/components/SecurityAuditLog";
import { useSecurityLogger } from "@/hooks/useSecurityLogger";
import { useEffect } from "react";
import { useBroadcastNotifications } from "@/hooks/useBroadcastNotifications";
import NotificationsPanel from "@/components/NotificationsPanel";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage";
import { CookiesPolicyPage } from "@/pages/CookiesPolicyPage";
import { ImprintPage } from "@/pages/ImprintPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <DishFavoritesProvider>
            <OrderSimulatorProvider>
              <BroadcastFavoritesWrapper>
                <Router>
                  <div className="min-h-screen bg-background">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/restaurant/:restaurantSlug" element={<RestaurantPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/security-audit-log" element={<SecurityAuditLog />} />
                      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/cookies-policy" element={<CookiesPolicyPage />} />
                      <Route path="/imprint" element={<ImprintPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    <NotificationsPanel />
                    <Toaster />
                    <Sonner richColors />
                  </div>
                </Router>
              </BroadcastFavoritesWrapper>
            </OrderSimulatorProvider>
          </DishFavoritesProvider>
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
