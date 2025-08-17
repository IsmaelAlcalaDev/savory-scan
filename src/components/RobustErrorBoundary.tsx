
import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { errorHandler } from '@/services/errorHandlingService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  name?: string;
  enableRecovery?: boolean;
  maxRecoveryAttempts?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
  isRecovering: boolean;
  lastErrorTime: number;
}

class RobustErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;
  private recoveryTimeoutId?: NodeJS.Timeout;
  private readonly maxRetries: number;

  constructor(props: Props) {
    super(props);
    this.maxRetries = props.maxRecoveryAttempts || 3;
    this.state = { 
      hasError: false, 
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🚨 RobustErrorBoundary: Error detected:', error);
    
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true, 
      error,
      errorId,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { name = 'Unknown', onError } = this.props;
    
    console.error(`🚨 RobustErrorBoundary (${name}) caught error:`, error, errorInfo);
    
    // Log to error handling service
    errorHandler.logError(error, {
      component: `ErrorBoundary_${name}`,
      action: 'boundary_catch',
      metadata: {
        componentStack: errorInfo.componentStack?.substring(0, 1000),
        retryCount: this.state.retryCount,
        errorId: this.state.errorId,
        timestamp: Date.now()
      }
    });

    // Call optional error handler
    onError?.(error, errorInfo);

    // Auto-recovery for network/temporary errors
    if (this.shouldAutoRecover(error) && this.props.enableRecovery !== false) {
      this.scheduleAutoRecovery();
    }
  }

  private shouldAutoRecover(error: Error): boolean {
    const recoverablePatterns = [
      /fetch/i,
      /network/i,
      /timeout/i,
      /connection/i,
      /ChunkLoadError/i
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    );
  }

  private scheduleAutoRecovery(): void {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    // Exponential backoff: 2s, 4s, 8s
    const delay = Math.min(2000 * Math.pow(2, this.state.retryCount), 10000);
    
    this.setState({ isRecovering: true });

    this.recoveryTimeoutId = setTimeout(() => {
      console.log(`🔄 Auto-recovering from error (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
      this.handleRetry();
    }, delay);
  }

  private handleRetry = () => {
    console.log('🔄 RobustErrorBoundary: Manual retry initiated');
    
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorId: undefined,
      retryCount: prevState.retryCount + 1,
      isRecovering: false
    }));

    // Clear any pending timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  };

  private handleGoHome = () => {
    // Log navigation
    errorHandler.logError(new Error('User navigated home from error'), {
      component: `ErrorBoundary_${this.props.name || 'Unknown'}`,
      action: 'navigate_home',
      metadata: {
        errorId: this.state.errorId,
        retryCount: this.state.retryCount
      }
    });

    window.location.href = '/';
  };

  private handleReportBug = () => {
    const bugReport = {
      error: this.state.error?.message,
      stack: this.state.error?.stack?.substring(0, 500),
      errorId: this.state.errorId,
      component: this.props.name,
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
    
    // You could also send this to a bug tracking service
    console.log('🐛 Bug report copied to clipboard:', bugReport);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isNetworkError = this.state.error?.message.includes('fetch') || 
                            this.state.error?.message.includes('network') ||
                            this.state.error?.name.includes('ChunkLoadError');
      
      const canRetry = this.state.retryCount < this.maxRetries;
      const timeSinceError = Date.now() - this.state.lastErrorTime;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-destructive">
                {isNetworkError ? 'Error de Conexión' : 'Error del Sistema'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Componente: {this.props.name || 'Desconocido'}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                {isNetworkError 
                  ? 'Problema de conectividad detectado. El sistema intentará recuperarse automáticamente.'
                  : 'Se ha producido un error inesperado. Nuestro sistema de monitoreo ha sido alertado.'
                }
              </p>

              {this.state.isRecovering && (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Recuperando automáticamente...
                </div>
              )}

              {this.state.errorId && (
                <div className="text-xs text-muted-foreground text-center font-mono bg-muted p-2 rounded">
                  ID: {this.state.errorId}
                  <br />
                  Intentos: {this.state.retryCount}/{this.maxRetries}
                  <br />
                  Tiempo: {Math.round(timeSinceError / 1000)}s
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && !this.state.isRecovering && (
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                    disabled={this.state.isRecovering}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar ({this.state.retryCount}/{this.maxRetries})
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Inicio
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReportBug}
                    className="flex-1"
                    size="sm"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Reportar
                  </Button>
                </div>
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

export default RobustErrorBoundary;
