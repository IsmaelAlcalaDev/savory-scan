
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './useUserRole';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { useSecurityLogger } from './useSecurityLogger';
import { toast } from 'sonner';

interface AuthAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

export const useEnhancedAuth = () => {
  const { user, signIn, signOut } = useAuth();
  const { role, isAdmin } = useUserRole();
  const { monitorAuthEvent, checkRateLimit } = useSecurityMonitoring();
  const { logSecurityEvent } = useSecurityLogger();
  
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

  // Enhanced sign in with security monitoring
  const secureSignIn = async (email: string, password: string) => {
    // Check rate limiting
    if (!checkRateLimit('login', 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      toast.error('Too many login attempts. Please try again later.');
      return { error: { message: 'Rate limit exceeded' } };
    }

    // Check account lockout
    if (isLocked && lockoutUntil && new Date() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
      toast.error(`Account temporarily locked. Try again in ${remaining} minutes.`);
      return { error: { message: 'Account locked' } };
    }

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        // Log failed attempt
        const attempt: AuthAttempt = {
          email,
          timestamp: new Date(),
          success: false
        };
        
        setAuthAttempts(prev => [...prev.slice(-4), attempt]); // Keep last 5 attempts
        
        // Check for multiple failed attempts
        const recentFailures = authAttempts.filter(
          attempt => !attempt.success && 
          attempt.email === email &&
          Date.now() - attempt.timestamp.getTime() < 60 * 60 * 1000 // Within 1 hour
        ).length;

        if (recentFailures >= 4) {
          setIsLocked(true);
          setLockoutUntil(new Date(Date.now() + 15 * 60 * 1000)); // 15 minute lockout
          
          logSecurityEvent('account_locked', 'auth', undefined, {
            email,
            failed_attempts: recentFailures + 1,
            lockout_duration: 15 * 60 * 1000
          });
        }

        monitorAuthEvent('failure', { email, error: result.error.message });
        
        toast.error('Invalid credentials. Please check your email and password.');
      } else {
        // Successful login
        const attempt: AuthAttempt = {
          email,
          timestamp: new Date(),
          success: true
        };
        
        setAuthAttempts(prev => [...prev.slice(-4), attempt]);
        setIsLocked(false);
        setLockoutUntil(null);
        
        monitorAuthEvent('success', { email });
        
        toast.success('Successfully signed in!');
      }

      return result;
    } catch (error) {
      monitorAuthEvent('failure', { email, error: 'Network error' });
      toast.error('Network error. Please try again.');
      return { error: { message: 'Network error' } };
    }
  };

  // Enhanced sign out with security logging
  const secureSignOut = async () => {
    if (user) {
      logSecurityEvent('user_logout', 'auth', user.id, {
        session_duration: Date.now(),
        voluntary: true
      });
    }
    
    await signOut();
    toast.success('Successfully signed out');
  };

  // Monitor for privilege escalation attempts
  const checkPrivilegeAccess = (requiredRole: 'user' | 'moderator' | 'admin') => {
    if (!user) {
      logSecurityEvent('unauthorized_access_attempt', 'auth', undefined, {
        required_role: requiredRole,
        user_authenticated: false
      });
      return false;
    }

    const hasAccess = 
      (requiredRole === 'user') ||
      (requiredRole === 'moderator' && (role === 'moderator' || role === 'admin')) ||
      (requiredRole === 'admin' && role === 'admin');

    if (!hasAccess) {
      logSecurityEvent('privilege_escalation_attempt', 'auth', user.id, {
        required_role: requiredRole,
        user_role: role,
        timestamp: new Date().toISOString()
      });
    }

    return hasAccess;
  };

  // Session timeout monitoring
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);

      // Show warning 5 minutes before timeout
      warningId = setTimeout(() => {
        toast.warning('Your session will expire in 5 minutes. Please save your work.');
      }, 25 * 60 * 1000); // 25 minutes

      // Auto logout after 30 minutes of inactivity
      timeoutId = setTimeout(async () => {
        logSecurityEvent('session_timeout', 'auth', user.id, {
          timeout_duration: 30 * 60 * 1000,
          automatic: true
        });
        
        await secureSignOut();
        toast.info('Session expired due to inactivity');
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Reset timeout on user activity
    const resetOnActivity = () => resetTimeout();
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity);
    });

    resetTimeout(); // Initial timeout

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity);
      });
    };
  }, [user]);

  return {
    secureSignIn,
    secureSignOut,
    checkPrivilegeAccess,
    authAttempts,
    isLocked,
    lockoutUntil
  };
};
