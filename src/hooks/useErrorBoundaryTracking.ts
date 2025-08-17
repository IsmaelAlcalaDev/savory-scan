
import { useEffect, useCallback } from 'react';
import { errorHandler } from '@/services/errorHandlingService';

interface ErrorBoundaryInfo {
  componentStack: string;
  errorBoundary?: string;
}

export const useErrorBoundaryTracking = () => {
  const trackBoundaryError = useCallback((
    error: Error, 
    errorInfo: ErrorBoundaryInfo,
    boundaryName?: string
  ) => {
    errorHandler.logError(error, {
      component: boundaryName || 'ErrorBoundary',
      action: 'boundary_catch',
      metadata: {
        componentStack: errorInfo.componentStack?.substring(0, 1000),
        errorBoundary: errorInfo.errorBoundary,
        timestamp: Date.now()
      }
    });

    // Track recovery attempts
    const recoveryKey = `boundary_${boundaryName || 'default'}_recovery`;
    const recoveryCount = parseInt(sessionStorage.getItem(recoveryKey) || '0') + 1;
    sessionStorage.setItem(recoveryKey, recoveryCount.toString());

    // Alert if too many recoveries (possible error loop)
    if (recoveryCount > 3) {
      console.warn(`🚨 Error Boundary Recovery Loop Detected: ${boundaryName}`, {
        recoveries: recoveryCount,
        error: error.message
      });
      
      // Send critical alert
      errorHandler.logError(new Error('Error Boundary Recovery Loop'), {
        component: boundaryName || 'ErrorBoundary',
        action: 'recovery_loop',
        metadata: {
          recoveryCount,
          originalError: error.message,
          timestamp: Date.now()
        }
      });
    }
  }, []);

  const clearRecoveryCount = useCallback((boundaryName?: string) => {
    const recoveryKey = `boundary_${boundaryName || 'default'}_recovery`;
    sessionStorage.removeItem(recoveryKey);
  }, []);

  // Clear recovery counts on successful navigation
  useEffect(() => {
    const handleNavigation = () => {
      // Clear all recovery counts on successful page navigation
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('boundary_') && key.endsWith('_recovery')) {
          sessionStorage.removeItem(key);
        }
      });
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  return {
    trackBoundaryError,
    clearRecoveryCount
  };
};
