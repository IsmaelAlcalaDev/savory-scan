
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

// Define a simple JSON-compatible type for the database
type PreferencesJson = {
  language?: string;
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  diet?: {
    vegetarian?: boolean;
    vegan?: boolean;
    gluten_free?: boolean;
    lactose_free?: boolean;
  };
  location?: {
    auto_detect?: boolean;
    default_radius?: number;
  };
};

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
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.preferences) {
        const rawPrefs = data.preferences as PreferencesJson;
        
        const parsedPrefs: UserPreferences = {
          language: rawPrefs.language || defaultPreferences.language,
          theme: (['light', 'dark', 'system'].includes(rawPrefs.theme || '')) 
            ? (rawPrefs.theme as 'light' | 'dark' | 'system') 
            : defaultPreferences.theme,
          notifications: {
            email: rawPrefs.notifications?.email ?? defaultPreferences.notifications.email,
            push: rawPrefs.notifications?.push ?? defaultPreferences.notifications.push,
            sms: rawPrefs.notifications?.sms ?? defaultPreferences.notifications.sms,
          },
          diet: {
            vegetarian: rawPrefs.diet?.vegetarian ?? defaultPreferences.diet.vegetarian,
            vegan: rawPrefs.diet?.vegan ?? defaultPreferences.diet.vegan,
            gluten_free: rawPrefs.diet?.gluten_free ?? defaultPreferences.diet.gluten_free,
            lactose_free: rawPrefs.diet?.lactose_free ?? defaultPreferences.diet.lactose_free,
          },
          location: {
            auto_detect: rawPrefs.location?.auto_detect ?? defaultPreferences.location.auto_detect,
            default_radius: rawPrefs.location?.default_radius ?? defaultPreferences.location.default_radius,
          }
        };
        
        setPreferences(parsedPrefs);
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
      // Create a simple JSON payload
      const preferencesPayload: PreferencesJson = {
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
        .update({ preferences: preferencesPayload })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state with the full UserPreferences object
      const updatedPrefs: UserPreferences = {
        language: preferencesPayload.language!,
        theme: preferencesPayload.theme! as 'light' | 'dark' | 'system',
        notifications: {
          email: preferencesPayload.notifications!.email!,
          push: preferencesPayload.notifications!.push!,
          sms: preferencesPayload.notifications!.sms!,
        },
        diet: {
          vegetarian: preferencesPayload.diet!.vegetarian!,
          vegan: preferencesPayload.diet!.vegan!,
          gluten_free: preferencesPayload.diet!.gluten_free!,
          lactose_free: preferencesPayload.diet!.lactose_free!,
        },
        location: {
          auto_detect: preferencesPayload.location!.auto_detect!,
          default_radius: preferencesPayload.location!.default_radius!,
        }
      };

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
