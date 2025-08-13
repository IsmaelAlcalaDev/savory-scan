
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/shared/contexts/AuthContext";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import AdminDashboard from "@/apps/admin/pages/AdminDashboard";
import AdminUsers from "@/apps/admin/pages/AdminUsers";
import AdminRestaurants from "@/apps/admin/pages/AdminRestaurants";
import AdminAnalytics from "@/apps/admin/pages/AdminAnalytics";
import AdminSettings from "@/apps/admin/pages/AdminSettings";
import AdminAuth from "@/apps/admin/pages/AdminAuth";
import NotFound from "@/apps/admin/pages/NotFound";
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

const AdminApp = () => {
  console.log('AdminApp: Starting admin application');

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter basename="/admin">
                <Routes>
                  <Route path="/auth" element={<AdminAuth />} />
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/users" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminUsers />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/restaurants" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminRestaurants />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminAnalytics />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminSettings />
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

export default AdminApp;
