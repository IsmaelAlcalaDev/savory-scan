
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AuthProvider {
  id: string;
  provider: string;
  provider_user_id?: string;
  provider_email?: string;
  provider_data: any;
  created_at: string;
}

export const useAuthProviders = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<AuthProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuthProviders();
    } else {
      setProviders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAuthProviders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_auth_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching auth providers:', error);
      } else {
        setProviders(data || []);
      }
    } catch (error) {
      console.error('Error fetching auth providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔍';
      case 'apple':
        return '🍎';
      case 'github':
        return '🐙';
      case 'discord':
        return '🎮';
      default:
        return '🔐';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'apple':
        return 'Apple';
      case 'github':
        return 'GitHub';
      case 'discord':
        return 'Discord';
      case 'email':
        return 'Email/Contraseña';
      default:
        return provider;
    }
  };

  return {
    providers,
    loading,
    getProviderIcon,
    getProviderName,
    refetch: fetchAuthProviders
  };
};
