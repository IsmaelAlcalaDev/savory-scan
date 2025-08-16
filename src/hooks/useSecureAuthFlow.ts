
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const useSecureAuthFlow = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState<Date | null>(null);

  // Password strength validation
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const issues = [];
    if (password.length < minLength) issues.push(`Mínimo ${minLength} caracteres`);
    if (!hasUpperCase) issues.push('Una letra mayúscula');
    if (!hasLowerCase) issues.push('Una letra minúscula');
    if (!hasNumbers) issues.push('Un número');
    if (!hasSpecialChar) issues.push('Un carácter especial');
    
    return {
      isValid: issues.length === 0,
      issues,
      strength: Math.min(5 - issues.length, 5)
    };
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check for account lockout
  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts');
    if (stored) {
      const attempts = JSON.parse(stored);
      const now = Date.now();
      const recentAttempts = attempts.filter((attempt: number) => 
        now - attempt < 15 * 60 * 1000 // 15 minutes
      );
      
      setLoginAttempts(recentAttempts.length);
      
      if (recentAttempts.length >= 5) {
        const lockEnd = new Date(recentAttempts[0] + 15 * 60 * 1000);
        if (now < lockEnd.getTime()) {
          setIsLocked(true);
          setLockoutEnd(lockEnd);
        }
      }
    }
  }, []);

  const recordFailedAttempt = () => {
    const now = Date.now();
    const stored = localStorage.getItem('loginAttempts');
    const attempts = stored ? JSON.parse(stored) : [];
    
    const newAttempts = [...attempts, now].filter(attempt => 
      now - attempt < 15 * 60 * 1000
    );
    
    localStorage.setItem('loginAttempts', JSON.stringify(newAttempts));
    setLoginAttempts(newAttempts.length);
    
    if (newAttempts.length >= 5) {
      const lockEnd = new Date(now + 15 * 60 * 1000);
      setIsLocked(true);
      setLockoutEnd(lockEnd);
    }
  };

  const clearAttempts = () => {
    localStorage.removeItem('loginAttempts');
    setLoginAttempts(0);
    setIsLocked(false);
    setLockoutEnd(null);
  };

  const secureRegister = async (data: RegistrationData) => {
    setIsLoading(true);
    
    try {
      // Validate input
      if (!validateEmail(data.email)) {
        throw new Error('Formato de email inválido');
      }
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Contraseña debe incluir: ${passwordValidation.issues.join(', ')}`);
      }
      
      if (!data.firstName.trim() || !data.lastName.trim()) {
        throw new Error('Nombre y apellido son obligatorios');
      }

      // Register with email confirmation
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: data.firstName.trim(),
            last_name: data.lastName.trim(),
            phone: data.phone?.trim() || null,
            full_name: `${data.firstName.trim()} ${data.lastName.trim()}`
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
        }
        throw error;
      }

      return { 
        success: true, 
        email: data.email,
        needsConfirmation: true 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error en el registro",
        description: error.message || "No se pudo crear la cuenta",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Correo reenviado",
        description: "Hemos reenviado el correo de confirmación",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Error al reenviar",
        description: error.message || "No se pudo reenviar el correo",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  const secureLogin = async (data: LoginData) => {
    if (isLocked) {
      const remaining = lockoutEnd ? Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000) : 0;
      toast({
        title: "Cuenta bloqueada",
        description: `Demasiados intentos fallidos. Intenta en ${remaining} minutos.`,
        variant: "destructive"
      });
      return { success: false };
    }

    setIsLoading(true);
    
    try {
      if (!validateEmail(data.email)) {
        throw new Error('Formato de email inválido');
      }

      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        recordFailedAttempt();
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email o contraseña incorrectos');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Por favor confirma tu email antes de iniciar sesión');
        }
        throw error;
      }

      clearAttempts();
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente"
      });

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      toast({
        title: "Error con Google",
        description: error.message || "No se pudo iniciar sesión con Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    secureRegister,
    secureLogin,
    googleLogin,
    resendConfirmation,
    validatePassword,
    validateEmail,
    isLoading,
    loginAttempts,
    isLocked,
    lockoutEnd,
    maxAttempts: 5
  };
};
