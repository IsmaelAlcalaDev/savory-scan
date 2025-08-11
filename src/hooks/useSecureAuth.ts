
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface LoginAttempt {
  timestamp: number;
  ip?: string;
}

interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  requireEmailConfirmation: boolean;
  sessionTimeoutMs: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  requireEmailConfirmation: true,
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
};

export const useSecureAuth = () => {
  const { user, signIn: originalSignIn, signUp: originalSignUp } = useAuth();
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);

  // Load login attempts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
      try {
        const attempts = JSON.parse(stored);
        setLoginAttempts(attempts);
        checkLockoutStatus(attempts);
      } catch (error) {
        console.error('Error parsing login attempts:', error);
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Check if account is locked
  const checkLockoutStatus = (attempts: LoginAttempt[]) => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < DEFAULT_CONFIG.lockoutDurationMs
    );

    if (recentAttempts.length >= DEFAULT_CONFIG.maxLoginAttempts) {
      const oldestAttempt = recentAttempts[0];
      const lockoutEndTime = oldestAttempt.timestamp + DEFAULT_CONFIG.lockoutDurationMs;
      
      if (now < lockoutEndTime) {
        setIsLocked(true);
        setLockoutEnd(lockoutEndTime);
        return true;
      }
    }

    setIsLocked(false);
    setLockoutEnd(null);
    return false;
  };

  // Record failed login attempt
  const recordFailedAttempt = () => {
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
    };

    const updatedAttempts = [...loginAttempts, newAttempt];
    setLoginAttempts(updatedAttempts);
    localStorage.setItem('loginAttempts', JSON.stringify(updatedAttempts));
    
    checkLockoutStatus(updatedAttempts);
  };

  // Clear login attempts on successful login
  const clearAttempts = () => {
    setLoginAttempts([]);
    localStorage.removeItem('loginAttempts');
    setIsLocked(false);
    setLockoutEnd(null);
  };

  // Enhanced sign in with rate limiting
  const secureSignIn = async (email: string, password: string) => {
    if (isLocked) {
      const remainingTime = lockoutEnd ? Math.ceil((lockoutEnd - Date.now()) / 60000) : 0;
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
        variant: "destructive"
      });
      return { error: { message: 'Account locked due to too many failed attempts' } };
    }

    // Input validation
    if (!email || !password) {
      toast({
        title: "Invalid Input",
        description: "Email and password are required",
        variant: "destructive"
      });
      return { error: { message: 'Email and password are required' } };
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return { error: { message: 'Invalid email format' } };
    }

    try {
      const result = await originalSignIn(email, password);
      
      if (result.error) {
        recordFailedAttempt();
        
        // Don't reveal if email exists or not
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
        
        return result;
      } else {
        clearAttempts();
        
        // Log successful login for security monitoring
        await logSecurityEvent('successful_login', email);
        
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        
        return result;
      }
    } catch (error) {
      recordFailedAttempt();
      console.error('Login error:', error);
      return { error: { message: 'Login failed' } };
    }
  };

  // Enhanced sign up with email confirmation
  const secureSignUp = async (email: string, password: string) => {
    // Input validation
    if (!email || !password) {
      toast({
        title: "Invalid Input",
        description: "Email and password are required",
        variant: "destructive"
      });
      return { error: { message: 'Email and password are required' } };
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return { error: { message: 'Invalid email format' } };
    }

    if (!isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        variant: "destructive"
      });
      return { error: { message: 'Password too weak' } };
    }

    try {
      const result = await originalSignUp(email, password);
      
      if (!result.error && DEFAULT_CONFIG.requireEmailConfirmation) {
        toast({
          title: "Check Your Email",
          description: "Please check your email and click the confirmation link to complete registration",
        });
      }
      
      // Log registration attempt
      await logSecurityEvent('registration_attempt', email);
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: 'Registration failed' } };
    }
  };

  // Session timeout management
  useEffect(() => {
    if (!user) return;

    const sessionStart = Date.now();
    const timeoutId = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
      
      // Force logout
      supabase.auth.signOut();
    }, DEFAULT_CONFIG.sessionTimeoutMs);

    return () => clearTimeout(timeoutId);
  }, [user]);

  // Security event logging
  const logSecurityEvent = async (eventType: string, email?: string) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: `security_${eventType}`,
        entity_type: 'user',
        properties: {
          email: email ? email.substring(0, 3) + '***' : undefined, // Anonymized
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return {
    secureSignIn,
    secureSignUp,
    isLocked,
    lockoutEnd,
    remainingAttempts: Math.max(0, DEFAULT_CONFIG.maxLoginAttempts - loginAttempts.length),
  };
};

// Utility functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};
