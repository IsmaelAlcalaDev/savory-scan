
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Auth() {
  const { user } = useAuth();
  const { 
    secureSignIn, 
    secureSignUp, 
    isLocked, 
    lockoutEnd, 
    remainingAttempts 
  } = useSecureAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Password strength validation
  const getPasswordStrength = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength(password);
  const isPasswordStrong = passwordStrength.score >= 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLocked) {
      const remainingTime = lockoutEnd ? Math.ceil((lockoutEnd - Date.now()) / 60000) : 0;
      setError(`Account locked. Try again in ${remainingTime} minutes.`);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!isPasswordStrong) {
          setError('Password does not meet security requirements');
          setLoading(false);
          return;
        }
        
        const result = await secureSignUp(email, password);
        if (!result.error) {
          setSuccess('Check your email for confirmation link');
          setEmail('');
          setPassword('');
          setIsSignUp(false);
        } else {
          setError(result.error.message || 'Registration failed');
        }
      } else {
        const result = await secureSignIn(email, password);
        if (result.error) {
          setError(result.error.message || 'Login failed');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderLockoutWarning = () => {
    if (isLocked && lockoutEnd) {
      const remainingTime = Math.ceil((lockoutEnd - Date.now()) / 60000);
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Account locked due to too many failed attempts. Try again in {remainingTime} minutes.
          </AlertDescription>
        </Alert>
      );
    }

    if (remainingAttempts < 3 && remainingAttempts > 0) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Warning: {remainingAttempts} login attempts remaining before account lockout.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const renderPasswordStrength = () => {
    if (!isSignUp || !password) return null;

    return (
      <div className="space-y-2 mt-2">
        <div className="text-sm font-medium">Password Requirements:</div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          {Object.entries({
            length: 'At least 8 characters',
            uppercase: 'One uppercase letter',
            lowercase: 'One lowercase letter',
            numbers: 'One number',
            special: 'One special character'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-red-600" />
              )}
              <span className={
                passwordStrength.checks[key as keyof typeof passwordStrength.checks] 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                passwordStrength.score >= 4 ? 'bg-green-500' :
                passwordStrength.score >= 3 ? 'bg-yellow-500' :
                passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>
          <Badge variant={isPasswordStrong ? 'default' : 'destructive'}>
            {isPasswordStrong ? 'Strong' : 'Weak'}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} | SavorySearch</title>
        <meta name="description" content="Secure authentication for SavorySearch platform" />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-card border-glass shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Secure Access</CardTitle>
            </div>
            <p className="text-muted-foreground">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {renderLockoutWarning()}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs value={isSignUp ? 'signup' : 'signin'} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger 
                  value="signin" 
                  onClick={() => setIsSignUp(false)}
                  disabled={loading}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  onClick={() => setIsSignUp(true)}
                  disabled={loading}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || isLocked}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || isLocked}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || isLocked || !email || !password}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {renderPasswordStrength()}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !email || !isPasswordStrong}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <div className="text-xs text-muted-foreground">
                Protected by advanced security measures
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
