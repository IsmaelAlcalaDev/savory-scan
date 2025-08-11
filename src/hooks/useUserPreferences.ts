
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
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
      } else if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
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
          }
        })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: any) => {
    if (!user || !preferences) return;

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data);
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
