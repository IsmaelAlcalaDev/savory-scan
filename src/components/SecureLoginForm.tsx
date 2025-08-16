
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useSecureAuthFlow } from '@/hooks/useSecureAuthFlow';

interface SecureLoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function SecureLoginForm({ 
  onSuccess, 
  onSwitchToRegister 
}: SecureLoginFormProps) {
  const { 
    secureLogin, 
    googleLogin, 
    validateEmail, 
    isLoading, 
    loginAttempts, 
    isLocked, 
    lockoutEnd, 
    maxAttempts 
  } = useSecureAuthFlow();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Contraseña es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await secureLogin(formData);
    
    if (result.success) {
      onSuccess?.();
    }
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  const renderSecurityWarning = () => {
    if (isLocked && lockoutEnd) {
      const remainingTime = Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000);
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Cuenta bloqueada temporalmente. Intenta de nuevo en {remainingTime} minutos.
          </AlertDescription>
        </Alert>
      );
    }

    if (loginAttempts > 0 && loginAttempts < maxAttempts) {
      const remaining = maxAttempts - loginAttempts;
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {remaining} intentos restantes antes del bloqueo temporal.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Accede a tu cuenta de forma segura
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {renderSecurityWarning()}

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isLocked}
          className="w-full h-12 bg-white border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span className="text-gray-700 font-medium">Continuar con Google</span>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                className="pl-10"
                disabled={isLoading || isLocked}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10"
                disabled={isLoading || isLocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isLoading || isLocked}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isLocked || !formData.email || !formData.password}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              Regístrate aquí
            </button>
          </p>
        </div>

        {/* Security Info */}
        <div className="text-center">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            Protegido con seguridad avanzada
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
