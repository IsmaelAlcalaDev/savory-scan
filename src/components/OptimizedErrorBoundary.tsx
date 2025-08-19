
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
}

class OptimizedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🚨 ErrorBoundary: Error detected:', error);
    
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Log error for analytics (non-blocking)
    this.logError(error, errorInfo).catch(console.warn);
  }

  private async logError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase.from('analytics_events').insert({
        event_type: 'error',
        event_name: 'error_boundary_triggered',
        properties: {
          error_id: this.state.errorId,
          error_message: error.message,
          error_stack: error.stack?.substring(0, 1000), // Truncate to avoid size limits
          component_stack: errorInfo.componentStack?.substring(0, 1000),
          retry_count: this.state.retryCount,
          timestamp: Date.now(),
          user_agent: navigator.userAgent
        }
      });
    } catch (logError) {
      console.warn('Failed to log error to analytics:', logError);
    }
  }

  private handleRetry = () => {
    console.log('🔄 ErrorBoundary: Retrying...');
    
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorId: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Auto-retry with exponential backoff for network errors
    if (this.state.error?.message.includes('fetch') || this.state.error?.message.includes('network')) {
      const backoffDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
      
      this.retryTimeoutId = setTimeout(() => {
        this.forceUpdate();
      }, backoffDelay);
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message.includes('fetch') || this.state.error?.message.includes('network');
      const canRetry = this.state.retryCount < 3;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {isNetworkError ? 'Error de Conexión' : 'Algo salió mal'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                {isNetworkError 
                  ? 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
                  : 'Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.'
                }
              </p>

              {this.state.errorId && (
                <div className="text-xs text-muted-foreground text-center font-mono">
                  ID: {this.state.errorId}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    disabled={this.state.retryCount >= 3}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar {this.state.retryCount > 0 && `(${this.state.retryCount}/3)`}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Detalles técnicos
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OptimizedErrorBoundary;
