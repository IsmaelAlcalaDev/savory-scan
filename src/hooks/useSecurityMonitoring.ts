
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  type: 'suspicious_activity' | 'failed_login' | 'unauthorized_access' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  // Log security events
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: `security_${event.type}`,
        entity_type: 'security',
        user_id: user?.id,
        properties: {
          severity: event.severity,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          ...event.details,
        }
      });

      // For critical events, also create fraud alerts
      if (event.severity === 'critical') {
        await supabase.from('fraud_alerts').insert({
          entity_type: 'user',
          entity_id: user?.id || 'anonymous',
          severity_level: 5,
          status: 'pending',
          alert_data: {
            event_type: event.type,
            details: event.details,
            auto_generated: true,
          }
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  // Monitor for suspicious activity
  useEffect(() => {
    // Monitor rapid-fire clicks
    let clickCount = 0;
    const clickWindow = 5000; // 5 seconds
    let clickTimer: NodeJS.Timeout;

    const handleClick = () => {
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, clickWindow);
      }
      
      if (clickCount > 20) { // More than 20 clicks in 5 seconds
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: {
            reason: 'rapid_clicking',
            click_count: clickCount,
            window_ms: clickWindow,
          }
        });
        clickCount = 0;
      }
    };

    // Monitor console access attempts
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args.some(arg => typeof arg === 'string' && 
          (arg.includes('document.cookie') || arg.includes('localStorage') || arg.includes('sessionStorage')))) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          details: {
            reason: 'console_data_access_attempt',
            args: args.map(arg => String(arg).substring(0, 100)), // Truncate for safety
          }
        });
      }
      originalConsoleLog.apply(console, args);
    };

    // Monitor for devtools
    let devtoolsOpen = false;
    const checkDevtools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          logSecurityEvent({
            type: 'suspicious_activity',
            severity: 'low',
            details: {
              reason: 'devtools_opened',
              window_dimensions: {
                outer: [window.outerWidth, window.outerHeight],
                inner: [window.innerWidth, window.innerHeight],
              }
            }
          });
        }
      } else {
        devtoolsOpen = false;
      }
    };

    // Monitor for copy/paste of sensitive data
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection()?.toString() || '';
      if (selection.includes('@') && selection.includes('.') && selection.length > 50) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: {
            reason: 'large_data_copy',
            selection_length: selection.length,
            contains_email: true,
          }
        });
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('copy', handleCopy);
    const devtoolsInterval = setInterval(checkDevtools, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('copy', handleCopy);
      clearInterval(devtoolsInterval);
      clearTimeout(clickTimer);
      console.log = originalConsoleLog; // Restore original console.log
    };
  }, [logSecurityEvent]);

  // Monitor authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && session) {
        logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          details: {
            reason: 'unexpected_signout',
            had_session: true,
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
  };
};
