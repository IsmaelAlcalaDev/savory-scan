
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
      console.log('Fetching user preferences for user:', user.id);
      
      // Try to fetch from user_preferences table using raw query since it's not in types yet
      const { data, error } = await supabase
        .from('user_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        // Create default preferences if query failed
        const defaultPrefs = createDefaultPreferences(user.id);
        setPreferences(defaultPrefs);
      } else if (data) {
        console.log('Found user preferences:', data);
        // Safely convert the data to UserPreferences type
        const userPrefs = convertToUserPreferences(data);
        setPreferences(userPrefs);
      } else {
        console.log('No preferences found, creating default');
        // Create default preferences if none exist
        await createDefaultPreferencesInDB();
      }
    } catch (error) {
      console.error('Error in fetchPreferences:', error);
      // Fallback to default preferences
      const fallbackPrefs = createDefaultPreferences(user.id);
      setPreferences(fallbackPrefs);
    } finally {
      setLoading(false);
    }
  };

  const convertToUserPreferences = (data: any): UserPreferences => {
    return {
      id: data?.id || `temp_${user?.id}`,
      user_id: data?.user_id || user?.id || '',
      preferences: data?.preferences || getDefaultPreferencesObject(),
      created_at: data?.created_at || new Date().toISOString(),
      updated_at: data?.updated_at || new Date().toISOString()
    };
  };

  const getDefaultPreferencesObject = () => ({
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
  });

  const createDefaultPreferences = (userId?: string): UserPreferences => {
    const defaultPrefs = getDefaultPreferencesObject();
    return {
      id: `temp_${userId || user?.id}`,
      user_id: userId || user?.id || '',
      preferences: defaultPrefs,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const createDefaultPreferencesInDB = async () => {
    if (!user) return;

    try {
      console.log('Creating default preferences in DB');
      const defaultPreferences = getDefaultPreferencesObject();

      const { data, error } = await supabase
        .from('user_preferences' as any)
        .insert({
          user_id: user.id,
          preferences: defaultPreferences
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
        throw error;
      }

      console.log('Created default preferences:', data);
      // Safely convert the response
      const userPrefs = convertToUserPreferences(data);
      setPreferences(userPrefs);
    } catch (error) {
      console.error('Error creating default preferences:', error);
      // Set local fallback
      const fallbackPrefs = createDefaultPreferences(user.id);
      setPreferences(fallbackPrefs);
    }
  };

  const updatePreferences = async (newPreferences: any) => {
    if (!user || !preferences) return;

    setUpdating(true);
    try {
      console.log('Updating preferences:', newPreferences);

      const { data, error } = await supabase
        .from('user_preferences' as any)
        .update({
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }
      
      console.log('Updated preferences:', data);
      // Safely convert the response
      const userPrefs = convertToUserPreferences(data);
      setPreferences(userPrefs);
      
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
