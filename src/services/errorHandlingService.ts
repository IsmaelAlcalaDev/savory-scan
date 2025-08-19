
interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  additionalInfo?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  type: 'javascript' | 'promise_rejection' | 'network' | 'runtime';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
}

class ErrorHandlingService {
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;
  private maxQueueSize = 100;
  private flushInterval = 10000; // 10 seconds
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeErrorHandlers();
    this.setupNetworkStatusListener();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `err_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeErrorHandlers() {
    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript',
        severity: this.determineSeverity(event.error),
        context: this.getErrorContext()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        type: 'promise_rejection',
        severity: 'high',
        context: this.getErrorContext({
          rejectionReason: event.reason
        })
      });
    });

    // Network errors (fetch failures)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch.apply(window, args);
        
        if (!response.ok) {
          this.handleError({
            message: `Network request failed: ${response.status} ${response.statusText}`,
            type: 'network',
            severity: response.status >= 500 ? 'high' : 'medium',
            context: this.getErrorContext({
              url: args[0],
              status: response.status,
              statusText: response.statusText
            })
          });
        }
        
        return response;
      } catch (error: any) {
        this.handleError({
          message: `Network request error: ${error.message}`,
          stack: error.stack,
          type: 'network',
          severity: 'high',
          context: this.getErrorContext({
            url: args[0],
            networkError: error.message
          })
        });
        throw error;
      }
    };
  }

  private setupNetworkStatusListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'low';
    
    const message = error.message.toLowerCase();
    
    // Critical errors that break core functionality
    if (message.includes('chunk load') || 
        message.includes('loading chunk') ||
        message.includes('auth') ||
        message.includes('payment')) {
      return 'critical';
    }
    
    // High severity errors
    if (message.includes('network') ||
        message.includes('fetch') ||
        message.includes('undefined is not a function') ||
        message.includes('cannot read property')) {
      return 'high';
    }
    
    // Medium severity errors
    if (message.includes('warning') ||
        message.includes('deprecated')) {
      return 'medium';
    }
    
    return 'low';
  }

  private getErrorContext(additionalInfo?: Record<string, any>): ErrorContext {
    return {
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      additionalInfo: {
        ...additionalInfo,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        memory: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      }
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from various sources
    try {
      const stored = localStorage.getItem('supabase.auth.token');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.user?.id;
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  private handleError(errorReport: ErrorReport) {
    console.error('🚨 Error captured:', errorReport);

    // Add to queue
    this.errorQueue.push(errorReport);

    // Prevent queue from growing too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }

    // Try immediate flush for critical errors
    if (errorReport.severity === 'critical' && this.isOnline) {
      this.flushErrorQueue();
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0 || !this.isOnline) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Properly serialize the error data to be compatible with Supabase Json type
      const analyticsEvents = errorsToSend.map(error => ({
        event_type: 'error',
        event_name: 'error_report',
        properties: {
          message: error.message,
          stack: error.stack?.substring(0, 2000) || null, // Truncate long stacks
          filename: error.filename || null,
          lineno: error.lineno || null,
          colno: error.colno || null,
          error_type: error.type,
          severity: error.severity,
          // Serialize context as a flat object to be compatible with Json type
          context: JSON.parse(JSON.stringify(error.context)), // Ensure deep serialization
          session_id: this.sessionId
        }
      }));

      await supabase.from('analytics_events').insert(analyticsEvents);
      
      console.log(`📊 Sent ${errorsToSend.length} error reports to analytics`);
    } catch (flushError) {
      console.warn('Failed to flush error queue:', flushError);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errorsToSend);
    }
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flushErrorQueue();
    }, this.flushInterval);
  }

  // Public method to manually report errors
  public reportError(error: Error, context?: Record<string, any>) {
    this.handleError({
      message: error.message,
      stack: error.stack,
      type: 'runtime',
      severity: this.determineSeverity(error),
      context: this.getErrorContext(context)
    });
  }

  // Public method to get error statistics
  public getErrorStats() {
    return {
      queueSize: this.errorQueue.length,
      sessionId: this.sessionId,
      isOnline: this.isOnline
    };
  }
}

// Export singleton instance
export const errorHandlingService = new ErrorHandlingService();

// Export types for external use
export type { ErrorReport, ErrorContext };
