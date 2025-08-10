
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para registrar el proveedor de autenticación
  const registerAuthProvider = async (user: User) => {
    try {
      const provider = user.app_metadata?.provider;
      if (!provider) return;

      console.log('Registrando proveedor de autenticación:', provider, user.email);

      // Obtener datos específicos del proveedor
      const providerUserId = user.identities?.[0]?.id || null;
      const providerEmail = user.email;
      const providerData = {
        name: user.user_metadata?.name || user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        email_verified: user.email_confirmed_at ? true : false,
        provider_metadata: user.user_metadata
      };

      await supabase.rpc('upsert_user_auth_provider', {
        p_provider: provider,
        p_provider_user_id: providerUserId,
        p_provider_email: providerEmail,
        p_provider_data: providerData
      });

      console.log('Proveedor de autenticación registrado exitosamente');
    } catch (error) {
      console.error('Error registrando proveedor de autenticación:', error);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state listener');
    
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Registrar proveedor cuando el usuario inicia sesión
      if (event === 'SIGNED_IN' && session?.user) {
        // Usar setTimeout para evitar deadlocks en onAuthStateChange
        setTimeout(() => {
          registerAuthProvider(session.user);
        }, 0);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Si ya hay una sesión activa, registrar el proveedor
      if (session?.user) {
        setTimeout(() => {
          registerAuthProvider(session.user);
        }, 0);
      }
    }).catch((error) => {
      console.error('AuthProvider: Error getting initial session:', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  console.log('AuthProvider: Rendering with state:', { user: user?.email, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
