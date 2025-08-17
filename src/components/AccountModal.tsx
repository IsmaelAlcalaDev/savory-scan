import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Phone,
  MapPin,
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useSecureAuthFlow } from '@/hooks/useSecureAuthFlow';
import FullScreenProfileModal from './FullScreenProfileModal';
import { User } from '@supabase/supabase-js';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const { user, loading } = useAuth();
  const { secureRegister, secureLogin, googleLogin, validatePassword, checkEmailExists, isLoading: authFlowLoading } = useSecureAuthFlow();
  const isMobile = useIsMobile();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  const isLoading = loading || authFlowLoading;
  const passwordValidation = validatePassword(password);

  // Si el usuario está logueado, mostrar la modal de perfil completa
  if (user) {
    return (
      <FullScreenProfileModal 
        open={open} 
        onOpenChange={onOpenChange} 
      />
    );
  }

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'phone':
        setPhone(value);
        break;
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEmailBlur = async () => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailCheckLoading(true);
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          setErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
        }
      } catch (error) {
        console.error('Error checking email:', error);
      } finally {
        setEmailCheckLoading(false);
      }
    }
  };

  const validateSignUpForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'Nombre es obligatorio';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Apellido es obligatorio';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!city.trim()) {
      newErrors.city = 'Ciudad es obligatoria';
    } else if (city.trim().length < 2) {
      newErrors.city = 'La ciudad debe tener al menos 2 caracteres';
    }

    if (!passwordValidation.isValid) {
      newErrors.password = 'La contraseña no cumple los requisitos de seguridad';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmación de contraseña es obligatoria';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Contraseña es obligatoria';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await secureLogin({ email, password });
    if (result.success) {
      setEmail('');
      setPassword('');
      setErrors({});
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }

    const result = await secureRegister({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      city,
      phone
    });
    
    if (result.success) {
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setCity('');
      setPhone('');
      setErrors({});
      
      if (result.needsConfirmation) {
        toast({
          title: "¡Registro exitoso!",
          description: "Revisa tu email para confirmar tu cuenta"
        });
        onOpenChange(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    await googleLogin();
  };

  const renderPasswordStrength = () => {
    if (!password) return null;

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                passwordValidation.strength >= 4 ? 'bg-green-500' :
                passwordValidation.strength >= 3 ? 'bg-yellow-500' :
                passwordValidation.strength >= 2 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
            />
          </div>
          <Badge variant={passwordValidation.isValid ? 'default' : 'destructive'} className="text-xs">
            {passwordValidation.isValid ? 'Fuerte' : 'Débil'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-xs">
          {passwordValidation.issues.map((issue, index) => (
            <div key={index} className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
              <span className="text-red-600 text-xs">{issue}</span>
            </div>
          ))}
          {passwordValidation.isValid && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-green-600 text-xs">Contraseña segura</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    const LoadingContent = (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

    return isMobile ? (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          {LoadingContent}
        </SheetContent>
      </Sheet>
    ) : (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          {LoadingContent}
        </DialogContent>
      </Dialog>
    );
  }

  const AuthContent = (
    <>
      <DialogHeader className={isMobile ? "pb-3" : "pb-4"}>
        <DialogTitle className={isMobile ? "text-lg" : "text-xl"}>Iniciar Sesión</DialogTitle>
        <DialogDescription className={`${isMobile ? "text-sm" : ""}`}>
          Accede a tu cuenta para guardar favoritos y gestionar tu perfil
        </DialogDescription>
      </DialogHeader>

      <div className={`space-y-3 ${isMobile ? "" : "space-y-4"}`}>
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full ${isMobile ? "h-11" : "h-12"} bg-white border border-gray-300 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
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
          <span className={`text-gray-700 font-medium ${isMobile ? "text-sm" : ""}`}>Continuar con Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con email
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin" className={isMobile ? "text-xs px-2" : ""}>Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="signup" className={isMobile ? "text-xs px-2" : ""}>Registrarse</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className={`space-y-3 ${isMobile ? "" : "space-y-4"}`}>
          
          <form onSubmit={handleSignIn} className={`space-y-3 ${isMobile ? "" : "space-y-4"}`}>
            <div className="space-y-2">
              <Label htmlFor="signin-email" className={isMobile ? "text-sm" : ""}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password" className={isMobile ? "text-sm" : ""}>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className={`w-full ${isMobile ? "h-11 text-base" : ""}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className={`space-y-3 ${isMobile ? "" : "space-y-4"}`}>
          
          <form onSubmit={handleSignUp} className={`space-y-3 ${isMobile ? "" : "space-y-4"}`}>
            <div className={`grid grid-cols-2 gap-3 ${isMobile ? "" : "gap-4"}`}>
              <div className="space-y-2">
                <Label htmlFor="signup-firstname" className={isMobile ? "text-sm" : ""}>Nombre *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-firstname"
                    type="text"
                    placeholder="Tu nombre"
                    value={firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-lastname" className={isMobile ? "text-sm" : ""}>Apellido *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-lastname"
                    type="text"
                    placeholder="Tu apellido"
                    value={lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                    disabled={isLoading}
                    required
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3 flex-shrink-0" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className={isMobile ? "text-sm" : ""}>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={handleEmailBlur}
                  className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading || emailCheckLoading}
                  required
                />
                {emailCheckLoading && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-city" className={isMobile ? "text-sm" : ""}>Ciudad *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-city"
                  type="text"
                  placeholder="Tu ciudad"
                  value={city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                  required
                />
              </div>
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-phone" className={isMobile ? "text-sm" : ""}>Teléfono (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+34 123 456 789"
                  value={phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`pl-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className={isMobile ? "text-sm" : ""}>Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
              {renderPasswordStrength()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password" className={isMobile ? "text-sm" : ""}>Confirmar Contraseña *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${isMobile ? "h-11 text-base" : ""}`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3 flex-shrink-0" />
                  {errors.confirmPassword}
                </p>
              )}
              {confirmPassword && password === confirmPassword && password && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-3 w-3 flex-shrink-0" />
                  <span>Las contraseñas coinciden</span>
                </div>
              )}
            </div>

            <Alert className={isMobile ? "py-2" : ""}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className={isMobile ? "text-xs" : ""}>
                Te enviaremos un email de confirmación. Debes hacer clic en el enlace para activar tu cuenta.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className={`w-full ${isMobile ? "h-11 text-base" : ""}`}
              disabled={
                isLoading || 
                !passwordValidation.isValid || 
                password !== confirmPassword ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim() ||
                !city.trim() ||
                !password ||
                !confirmPassword ||
                emailCheckLoading ||
                errors.email === 'Este email ya está registrado'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto p-4">
        {AuthContent}
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {AuthContent}
      </DialogContent>
    </Dialog>
  );
}
