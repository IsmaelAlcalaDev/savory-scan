
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityLogger } from './useSecurityLogger';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  type: 'login_attempt' | 'failed_auth' | 'suspicious_activity' | 'rate_limit_exceeded';
  timestamp: Date;
  details: any;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  lastSecurityEvent: Date | null;
  riskLevel: 'low' | 'medium' | 'high';
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityLogger();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    suspiciousActivities: 0,
    lastSecurityEvent: null,
    riskLevel: 'low'
  });

  const [rateLimitMap, setRateLimitMap] = useState<Map<string, number>>(new Map());

  // Rate limiting function
  const checkRateLimit = (action: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const key = `${user?.id || 'anonymous'}-${action}`;
    const attempts = rateLimitMap.get(key) || 0;

    if (attempts >= maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', 'security_monitoring', undefined, {
        action,
        attempts,
        user_id: user?.id,
        window_ms: windowMs
      });
      return false;
    }

    // Update rate limit counter
    setRateLimitMap(prev => new Map(prev.set(key, attempts + 1)));

    // Clear counter after window
    setTimeout(() => {
      setRateLimitMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }, windowMs);

    return true;
  };

  // Monitor suspicious patterns
  const detectSuspiciousActivity = (eventType: string, details: any) => {
    const suspiciousPatterns = [
      { pattern: 'rapid_requests', threshold: 50 },
      { pattern: 'multiple_failed_logins', threshold: 5 },
      { pattern: 'unusual_access_pattern', threshold: 3 },
      { pattern: 'data_scraping_attempt', threshold: 100 }
    ];

    suspiciousPatterns.forEach(({ pattern, threshold }) => {
      if (details[pattern] && details[pattern] > threshold) {
        logSecurityEvent('suspicious_activity_detected', 'security_monitoring', undefined, {
          pattern,
          value: details[pattern],
          threshold,
          user_id: user?.id,
          event_type: eventType
        });

        setSecurityMetrics(prev => ({
          ...prev,
          suspiciousActivities: prev.suspiciousActivities + 1,
          lastSecurityEvent: new Date(),
          riskLevel: prev.suspiciousActivities > 3 ? 'high' : 'medium'
        }));
      }
    });
  };

  // Monitor authentication events
  const monitorAuthEvent = (eventType: 'success' | 'failure', details: any = {}) => {
    if (eventType === 'failure') {
      setSecurityMetrics(prev => ({
        ...prev,
        failedLoginAttempts: prev.failedLoginAttempts + 1,
        lastSecurityEvent: new Date(),
        riskLevel: prev.failedLoginAttempts > 5 ? 'high' : prev.riskLevel
      }));

      logSecurityEvent('failed_authentication', 'auth', undefined, {
        attempt_count: securityMetrics.failedLoginAttempts + 1,
        ...details
      });
    } else {
      // Reset failed attempts on successful login
      setSecurityMetrics(prev => ({
        ...prev,
        failedLoginAttempts: 0,
        riskLevel: 'low'
      }));

      logSecurityEvent('successful_authentication', 'auth', undefined, details);
    }
  };

  // Enhanced session monitoring
  useEffect(() => {
    if (!user) return;

    const monitorSession = async () => {
      try {
        // Check for multiple active sessions
        const { data: sessions } = await supabase.auth.getSession();
        
        if (sessions.session) {
          logSecurityEvent('session_active', 'auth', user.id, {
            session_id: sessions.session.access_token.substring(0, 10),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    };

    // Monitor session every 5 minutes
    const sessionInterval = setInterval(monitorSession, 5 * 60 * 1000);
    
    // Initial check
    monitorSession();

    return () => clearInterval(sessionInterval);
  }, [user, logSecurityEvent]);

  // Monitor page visibility for session security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && user) {
        logSecurityEvent('page_hidden', 'session', user.id, {
          timestamp: new Date().toISOString(),
          duration_visible: Date.now()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, logSecurityEvent]);

  return {
    securityMetrics,
    checkRateLimit,
    detectSuspiciousActivity,
    monitorAuthEvent
  };
};
