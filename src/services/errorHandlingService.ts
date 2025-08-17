
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private retryConfigs: Map<string, RetryConfig> = new Map();
  private errorQueue: Array<{error: Error; context: ErrorContext; timestamp: number}> = [];
  private processingQueue = false;

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  constructor() {
    // Default retry configurations
    this.retryConfigs.set('api', {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    });

    this.retryConfigs.set('database', {
      maxRetries: 2,
      initialDelay: 500,
      maxDelay: 5000,
      backoffFactor: 2
    });

    this.retryConfigs.set('image', {
      maxRetries: 2,
      initialDelay: 200,
      maxDelay: 2000,
      backoffFactor: 1.5
    });

    // Process error queue periodically
    setInterval(() => this.processErrorQueue(), 5000);
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    operationType: string = 'api',
    context?: ErrorContext
  ): Promise<T> {
    const config = this.retryConfigs.get(operationType) || this.retryConfigs.get('api')!;
    let lastError: Error;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Log attempt
        console.warn(`Attempt ${attempt + 1}/${config.maxRetries + 1} failed:`, {
          error: lastError.message,
          context,
          operationType
        });

        // Don't retry on final attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Don't retry certain error types
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Wait before retry with exponential backoff
        await this.delay(Math.min(delay, config.maxDelay));
        delay *= config.backoffFactor;
      }
    }

    // Final failure - log and throw
    this.logError(lastError!, context);
    throw lastError!;
  }

  logError(error: Error, context?: ErrorContext): void {
    const errorData = {
      error,
      context: {
        ...context,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      timestamp: Date.now()
    };

    // Add to queue for batch processing
    this.errorQueue.push(errorData);

    // Immediate console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorData);
    }
  }

  private async processErrorQueue(): Promise<void> {
    if (this.processingQueue || this.errorQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      const { supabase } = await import('@/integrations/supabase/client');

      // Batch insert errors
      const errorEvents = errors.map(({error, context}) => ({
        event_type: 'error',
        event_name: 'runtime_error',
        properties: {
          error_message: error.message,
          error_stack: error.stack?.substring(0, 1000),
          component: context.component,
          action: context.action,
          user_id: context.userId,
          session_id: context.sessionId,
          metadata: context.metadata,
          timestamp: context.timestamp,
          user_agent: navigator.userAgent.substring(0, 200),
          url: window.location.href
        }
      }));

      if (errorEvents.length > 0) {
        await supabase.from('analytics_events').insert(errorEvents);
        console.log(`📊 Logged ${errorEvents.length} errors to analytics`);
      }
    } catch (logError) {
      console.warn('Failed to log errors to database:', logError);
      // Don't re-add to queue to avoid infinite loop
    } finally {
      this.processingQueue = false;
    }
  }

  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /400/i, // Bad Request
      /401/i, // Unauthorized
      /403/i, // Forbidden
      /404/i, // Not Found
      /422/i, // Unprocessable Entity
      /syntax error/i,
      /permission denied/i
    ];

    return nonRetryablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fallback handlers for different error types
  getFallbackData(errorType: string, context?: any): any {
    const fallbacks = {
      restaurants: [],
      dishes: [],
      user: null,
      location: { lat: 40.4168, lng: -3.7038 }, // Madrid default
      filters: {
        cuisineTypes: [],
        priceRanges: [],
        establishmentTypes: []
      }
    };

    return fallbacks[errorType as keyof typeof fallbacks] || null;
  }
}

export const errorHandler = ErrorHandlingService.getInstance();
