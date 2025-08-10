
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  diet: {
    vegetarian: boolean;
    vegan: boolean;
    gluten_free: boolean;
    lactose_free: boolean;
  };
  location: {
    auto_detect: boolean;
    default_radius: number;
  };
}

const defaultPreferences: UserPreferences = {
  language: 'es',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  diet: {
    vegetarian: false,
    vegan: false,
    gluten_free: false,
    lactose_free: false,
  },
  location: {
    auto_detect: true,
    default_radius: 5,
  },
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(defaultPreferences);
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('auth_user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences) {
        // Parse preferences safely
        const userPrefs = data.preferences;
        if (userPrefs && typeof userPrefs === 'object') {
          const parsedPrefs = {
            language: userPrefs.language || defaultPreferences.language,
            theme: userPrefs.theme || defaultPreferences.theme,
            notifications: {
              ...defaultPreferences.notifications,
              ...(userPrefs.notifications || {})
            },
            diet: {
              ...defaultPreferences.diet,
              ...(userPrefs.diet || {})
            },
            location: {
              ...defaultPreferences.location,
              ...(userPrefs.location || {})
            }
          } as UserPreferences;
          setPreferences(parsedPrefs);
        } else {
          setPreferences(defaultPreferences);
        }
      } else {
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Error al cargar preferencias');
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('users')
        .update({ preferences: updatedPreferences })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast.success('Preferencias actualizadas');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Error al actualizar preferencias');
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
  };
};
