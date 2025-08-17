import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { DishFavoritesProvider } from './contexts/DishFavoritesContext'
import { QueryProvider } from './contexts/QueryContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'
import { FoodieSpot } from './pages/FoodieSpot'
import { Auth } from './pages/Auth'
import { LocationEntry } from './pages/LocationEntry'
import { Restaurants } from './pages/Restaurants'
import { RestaurantProfile } from './pages/RestaurantProfile'
import { RestaurantMenu } from './pages/RestaurantMenu'
import { Dishes } from './pages/Dishes'
import { Account } from './pages/Account'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SecureAdminPanel } from './pages/SecureAdminPanel'
import { SecurityDashboard } from './pages/SecurityDashboard'
import { SuperAdminPanel } from './pages/SuperAdminPanel'
import { NotFound } from './pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { OrderSimulatorProvider } from './contexts/OrderSimulatorContext'
import RobustErrorBoundary from '@/components/RobustErrorBoundary'
import { useRealUserMonitoring } from '@/hooks/useRealUserMonitoring'
import { useEffect } from 'react'

function App() {
  // Initialize RUM monitoring
  const { trackError } = useRealUserMonitoring(true);

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      trackError(event.error?.message || 'Unknown error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('Unhandled Promise Rejection: ' + event.reason, {
        type: 'promise_rejection'
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return (
    <RobustErrorBoundary 
      name="App"
      enableRecovery={true}
      maxRecoveryAttempts={1}
    >
      <AnalyticsProvider>
        <QueryProvider>
          <AuthProvider>
            <BrowserRouter>
              <HelmetProvider>
                <FavoritesProvider>
                  <DishFavoritesProvider>
                    <OrderSimulatorProvider>
                      <div className="min-h-screen bg-background">
                        <Routes>
                          <Route path="/" element={<FoodieSpot />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/location" element={<LocationEntry />} />
                          <Route path="/restaurantes" element={
                            <RobustErrorBoundary 
                              name="RestaurantsPage"
                              enableRecovery={true}
                            >
                              <Restaurants />
                            </RobustErrorBoundary>
                          } />
                          <Route path="/restaurant/:slug" element={
                            <RobustErrorBoundary 
                              name="RestaurantProfile"
                              enableRecovery={true}
                            >
                              <RestaurantProfile />
                            </RobustErrorBoundary>
                          } />
                          <Route path="/restaurant/:slug/menu" element={
                            <RobustErrorBoundary 
                              name="RestaurantMenu"
                              enableRecovery={true}
                            >
                              <RestaurantMenu />
                            </RobustErrorBoundary>
                          } />
                          <Route path="/platos" element={
                            <RobustErrorBoundary 
                              name="DishesPage"
                              enableRecovery={true}
                            >
                              <Dishes />
                            </RobustErrorBoundary>
                          } />
                          <Route 
                            path="/account" 
                            element={
                              <RobustErrorBoundary 
                                name="AccountPage"
                                enableRecovery={true}
                              >
                                <ProtectedRoute>
                                  <Account />
                                </ProtectedRoute>
                              </RobustErrorBoundary>
                            } 
                          />
                          <Route 
                            path="/admin" 
                            element={
                              <RobustErrorBoundary 
                                name="AdminPanel"
                                enableRecovery={false}
                              >
                                <ProtectedRoute requiredRole="admin">
                                  <SecureAdminPanel />
                                </ProtectedRoute>
                              </RobustErrorBoundary>
                            } 
                          />
                          <Route 
                            path="/security" 
                            element={
                              <RobustErrorBoundary 
                                name="SecurityDashboard"
                                enableRecovery={false}
                              >
                                <ProtectedRoute requiredRole="security_admin">
                                  <SecurityDashboard />
                                </ProtectedRoute>
                              </RobustErrorBoundary>
                            } 
                          />
                          <Route 
                            path="/superadmin" 
                            element={
                              <RobustErrorBoundary 
                                name="SuperAdminPanel"
                                enableRecovery={false}
                              >
                                <ProtectedRoute requiredRole="super_admin">
                                  <SuperAdminPanel />
                                </ProtectedRoute>
                              </RobustErrorBoundary>
                            } 
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <Toaster />
                      </div>
                    </OrderSimulatorProvider>
                  </DishFavoritesProvider>
                </FavoritesProvider>
              </HelmetProvider>
            </BrowserRouter>
          </AuthProvider>
        </QueryProvider>
      </AnalyticsProvider>
    </RobustErrorBoundary>
  )
}

export default App
