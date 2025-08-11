
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UserPreferences {
  id: string;
  user_id: string;
  preferences: any;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      // Try to fetch from user_preferences table, fallback if not available
      const { data, error } = await supabase
        .from('user_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        // Create a default preferences object
        const defaultPrefs: UserPreferences = {
          id: `temp_${user.id}`,
          user_id: user.id,
          preferences: {
            theme: 'system',
            language: 'es',
            notifications: {
              email: true,
              push: true,
              marketing: false
            },
            dietary: {
              vegetarian: false,
              vegan: false,
              glutenFree: false,
              lactoseFree: false
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPreferences(defaultPrefs);
      } else if (data) {
        setPreferences(data as UserPreferences);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Fallback to default preferences
      const defaultPrefs: UserPreferences = {
        id: `temp_${user.id}`,
        user_id: user.id,
        preferences: {
          theme: 'system',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          dietary: {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            lactoseFree: false
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setPreferences(defaultPrefs);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const defaultPreferences = {
        theme: 'system',
        language: 'es',
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        dietary: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          lactoseFree: false
        }
      };

      const { data, error } = await supabase
        .from('user_preferences' as any)
        .insert({
          user_id: user.id,
          preferences: defaultPreferences
        })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data as UserPreferences);
    } catch (error) {
      console.error('Error creating default preferences:', error);
      // Set local fallback
      const fallbackPrefs: UserPreferences = {
        id: `temp_${user.id}`,
        user_id: user.id,
        preferences: {
          theme: 'system',
          language: 'es',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          dietary: {
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            lactoseFree: false
          }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setPreferences(fallbackPrefs);
    }
  };

  const updatePreferences = async (newPreferences: any) => {
    if (!user || !preferences) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences' as any)
        .update({
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data as UserPreferences);
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    preferences,
    loading,
    updating,
    updatePreferences,
    refetch: fetchPreferences
  };
};
