
interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any; // Allow additional properties
}

interface ErrorLogEntry {
  id: string;
  timestamp: number;
  error: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class ErrorHandlingService {
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize = 1000;
  
  constructor() {
    // Initialize error boundaries
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), {
        component: 'Global',
        action: 'unhandledRejection'
      });
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        component: 'Global',
        action: 'globalError',
        url: event.filename,
        metadata: {
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });
  }

  logError(error: Error, context: ErrorContext = {}) {
    const errorEntry: ErrorLogEntry = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: Date.now(), // Add timestamp to context
        url: context.url || window.location.href,
        userAgent: context.userAgent || navigator.userAgent
      },
      severity: this.determineSeverity(error, context),
      resolved: false
    };

    // Add to local log
    this.errorLog.push(errorEntry);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize / 2);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorEntry);
    }

    // Send to remote logging service
    this.sendErrorToRemote(errorEntry).catch(console.warn);

    return errorEntry.id;
  }

  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical: Authentication, payment, security issues
    if (context.component?.toLowerCase().includes('auth') || 
        context.component?.toLowerCase().includes('security') ||
        error.message.toLowerCase().includes('unauthorized')) {
      return 'critical';
    }

    // High: Core functionality failures
    if (context.component?.toLowerCase().includes('restaurant') ||
        context.component?.toLowerCase().includes('dish') ||
        error.message.toLowerCase().includes('network')) {
      return 'high';
    }

    // Medium: UI/UX issues
    if (context.component?.toLowerCase().includes('modal') ||
        context.component?.toLowerCase().includes('form')) {
      return 'medium';
    }

    return 'low';
  }

  private async sendErrorToRemote(errorEntry: ErrorLogEntry) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'error',
        event_name: 'error_logged',
        properties: {
          error_id: errorEntry.id,
          error_message: errorEntry.error,
          error_stack: errorEntry.stack?.substring(0, 1000), // Truncate to avoid size limits
          severity: errorEntry.severity,
          context: errorEntry.context,
          timestamp: errorEntry.timestamp
        }
      });
    } catch (logError) {
      console.warn('Failed to send error to remote logging:', logError);
    }
  }

  // Get error statistics
  getErrorStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const recentErrors = this.errorLog.filter(e => now - e.timestamp < oneHour);
    const dailyErrors = this.errorLog.filter(e => now - e.timestamp < oneDay);

    return {
      total: this.errorLog.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      critical: this.errorLog.filter(e => e.severity === 'critical').length,
      high: this.errorLog.filter(e => e.severity === 'high').length,
      resolved: this.errorLog.filter(e => e.resolved).length
    };
  }

  // Mark error as resolved
  resolveError(errorId: string) {
    const error = this.errorLog.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return this.errorLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // Clear resolved errors
  clearResolvedErrors() {
    this.errorLog = this.errorLog.filter(e => !e.resolved);
  }
}

export const errorHandler = new ErrorHandlingService();
