
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
        const rawPrefs = data.preferences;
        
        if (rawPrefs && typeof rawPrefs === 'object' && !Array.isArray(rawPrefs)) {
          const userPrefs = rawPrefs as any;
          
          const parsedPrefs: UserPreferences = {
            language: typeof userPrefs.language === 'string' ? userPrefs.language : defaultPreferences.language,
            theme: ['light', 'dark', 'system'].includes(userPrefs.theme) ? userPrefs.theme : defaultPreferences.theme,
            notifications: {
              email: typeof userPrefs.notifications?.email === 'boolean' ? userPrefs.notifications.email : defaultPreferences.notifications.email,
              push: typeof userPrefs.notifications?.push === 'boolean' ? userPrefs.notifications.push : defaultPreferences.notifications.push,
              sms: typeof userPrefs.notifications?.sms === 'boolean' ? userPrefs.notifications.sms : defaultPreferences.notifications.sms,
            },
            diet: {
              vegetarian: typeof userPrefs.diet?.vegetarian === 'boolean' ? userPrefs.diet.vegetarian : defaultPreferences.diet.vegetarian,
              vegan: typeof userPrefs.diet?.vegan === 'boolean' ? userPrefs.diet.vegan : defaultPreferences.diet.vegan,
              gluten_free: typeof userPrefs.diet?.gluten_free === 'boolean' ? userPrefs.diet.gluten_free : defaultPreferences.diet.gluten_free,
              lactose_free: typeof userPrefs.diet?.lactose_free === 'boolean' ? userPrefs.diet.lactose_free : defaultPreferences.diet.lactose_free,
            },
            location: {
              auto_detect: typeof userPrefs.location?.auto_detect === 'boolean' ? userPrefs.location.auto_detect : defaultPreferences.location.auto_detect,
              default_radius: typeof userPrefs.location?.default_radius === 'number' ? userPrefs.location.default_radius : defaultPreferences.location.default_radius,
            }
          };
          
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
      // Create the updated preferences object
      const updatedPrefs = {
        language: newPreferences.language || preferences.language,
        theme: newPreferences.theme || preferences.theme,
        notifications: {
          email: newPreferences.notifications?.email !== undefined ? newPreferences.notifications.email : preferences.notifications.email,
          push: newPreferences.notifications?.push !== undefined ? newPreferences.notifications.push : preferences.notifications.push,
          sms: newPreferences.notifications?.sms !== undefined ? newPreferences.notifications.sms : preferences.notifications.sms,
        },
        diet: {
          vegetarian: newPreferences.diet?.vegetarian !== undefined ? newPreferences.diet.vegetarian : preferences.diet.vegetarian,
          vegan: newPreferences.diet?.vegan !== undefined ? newPreferences.diet.vegan : preferences.diet.vegan,
          gluten_free: newPreferences.diet?.gluten_free !== undefined ? newPreferences.diet.gluten_free : preferences.diet.gluten_free,
          lactose_free: newPreferences.diet?.lactose_free !== undefined ? newPreferences.diet.lactose_free : preferences.diet.lactose_free,
        },
        location: {
          auto_detect: newPreferences.location?.auto_detect !== undefined ? newPreferences.location.auto_detect : preferences.location.auto_detect,
          default_radius: newPreferences.location?.default_radius !== undefined ? newPreferences.location.default_radius : preferences.location.default_radius,
        }
      };
      
      const { error } = await supabase
        .from('users')
        .update({ preferences: updatedPrefs as any })
        .eq('auth_user_id', user.id);

      if (error) throw error;

      setPreferences(updatedPrefs);
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
