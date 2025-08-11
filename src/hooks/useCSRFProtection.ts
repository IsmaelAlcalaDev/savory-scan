
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCSRFProtection = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate CSRF token
  const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Initialize CSRF token
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    sessionStorage.setItem('csrf_token', token);
  }, []);

  // Validate CSRF token
  const validateCSRFToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token.length === 64;
  };

  // Get headers with CSRF protection
  const getSecureHeaders = (): Record<string, string> => {
    return {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    };
  };

  // Secure API call wrapper
  const secureApiCall = async (
    operation: () => Promise<any>,
    requireAuth: boolean = true
  ) => {
    if (requireAuth) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }
    }

    // Add security headers to the operation context
    const headers = getSecureHeaders();
    
    try {
      return await operation();
    } catch (error) {
      console.error('Secure API call failed:', error);
      throw error;
    }
  };

  return {
    csrfToken,
    validateCSRFToken,
    getSecureHeaders,
    secureApiCall,
  };
};
