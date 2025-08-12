
import { useState, useEffect } from 'react';
import { useSecurityLogger } from './useSecurityLogger';

interface SecurityEvent {
  type: 'login' | 'failed_login' | 'suspicious_activity' | 'rate_limit' | 'privilege_escalation';
  details: any;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

interface RateLimitEntry {
  key: string;
  count: number;
  lastAttempt: Date;
}

export const useSecurityMonitoring = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [rateLimits, setRateLimits] = useState<Map<string, RateLimitEntry>>(new Map());
  const { logSecurityEvent } = useSecurityLogger();

  // Monitor authentication events
  const monitorAuthEvent = (type: 'success' | 'failure', details: any) => {
    const event: SecurityEvent = {
      type: type === 'success' ? 'login' : 'failed_login',
      details,
      timestamp: new Date(),
      severity: type === 'failure' ? 'medium' : 'low'
    };

    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events

    // Log to analytics
    logSecurityEvent(
      type === 'success' ? 'login_success' : 'login_failure',
      'auth',
      undefined,
      details
    );

    // Check for suspicious patterns
    if (type === 'failure') {
      checkSuspiciousActivity(details.email);
    }
  };

  // Rate limiting check
  const checkRateLimit = (action: string, maxAttempts: number, windowMs: number): boolean => {
    const key = `${action}_${Date.now() - (Date.now() % windowMs)}`;
    const now = new Date();
    
    const entry = rateLimits.get(key) || { key, count: 0, lastAttempt: now };
    
    if (now.getTime() - entry.lastAttempt.getTime() > windowMs) {
      // Reset if window has passed
      entry.count = 1;
      entry.lastAttempt = now;
    } else {
      entry.count += 1;
    }

    setRateLimits(prev => new Map(prev.set(key, entry)));

    if (entry.count > maxAttempts) {
      const event: SecurityEvent = {
        type: 'rate_limit',
        details: { action, attempts: entry.count, window: windowMs },
        timestamp: now,
        severity: 'high'
      };

      setEvents(prev => [...prev.slice(-99), event]);
      
      logSecurityEvent('rate_limit_exceeded', 'security', undefined, {
        action,
        attempts: entry.count,
        window: windowMs
      });

      return false;
    }

    return true;
  };

  // Check for suspicious activity patterns
  const checkSuspiciousActivity = (identifier: string) => {
    const recentFailures = events.filter(
      event => 
        event.type === 'failed_login' && 
        event.details.email === identifier &&
        Date.now() - event.timestamp.getTime() < 15 * 60 * 1000 // 15 minutes
    );

    if (recentFailures.length >= 5) {
      const event: SecurityEvent = {
        type: 'suspicious_activity',
        details: { 
          identifier, 
          failureCount: recentFailures.length,
          timeWindow: '15 minutes'
        },
        timestamp: new Date(),
        severity: 'high'
      };

      setEvents(prev => [...prev.slice(-99), event]);
      
      logSecurityEvent('suspicious_login_pattern', 'security', undefined, {
        identifier: identifier.substring(0, 3) + '***', // Anonymized
        failureCount: recentFailures.length
      });
    }
  };

  // Monitor privilege escalation attempts
  const monitorPrivilegeEscalation = (userId: string, attemptedAction: string, requiredRole: string) => {
    const event: SecurityEvent = {
      type: 'privilege_escalation',
      details: { userId, attemptedAction, requiredRole },
      timestamp: new Date(),
      severity: 'high'
    };

    setEvents(prev => [...prev.slice(-99), event]);
    
    logSecurityEvent('privilege_escalation_attempt', 'security', userId, {
      attemptedAction,
      requiredRole
    });
  };

  // Get security summary
  const getSecuritySummary = () => {
    const now = Date.now();
    const last24h = events.filter(event => now - event.timestamp.getTime() < 24 * 60 * 60 * 1000);
    
    return {
      totalEvents: last24h.length,
      highSeverityEvents: last24h.filter(e => e.severity === 'high').length,
      mediumSeverityEvents: last24h.filter(e => e.severity === 'medium').length,
      lowSeverityEvents: last24h.filter(e => e.severity === 'low').length,
      mostCommonEvent: getMostCommonEventType(last24h)
    };
  };

  const getMostCommonEventType = (events: SecurityEvent[]) => {
    const counts = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
  };

  // Cleanup old rate limit entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setRateLimits(prev => {
        const cleaned = new Map();
        prev.forEach((entry, key) => {
          if (now - entry.lastAttempt.getTime() < 60 * 60 * 1000) { // Keep for 1 hour
            cleaned.set(key, entry);
          }
        });
        return cleaned;
      });
    }, 5 * 60 * 1000); // Cleanup every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    events,
    monitorAuthEvent,
    checkRateLimit,
    monitorPrivilegeEscalation,
    getSecuritySummary
  };
};
