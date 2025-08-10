
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UserPreferences {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
  };
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    lactoseFree?: boolean;
  };
  location?: {
    defaultRadius?: number;
    rememberLastLocation?: boolean;
  };
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences({});
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
      } else {
        setPreferences(data?.preferences || {});
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return false;

    setUpdating(true);
    try {
      const mergedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('users')
        .update({ 
          preferences: mergedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Error",
          description: "No se pudieron actualizar las preferencias",
          variant: "destructive"
        });
        return false;
      } else {
        setPreferences(mergedPreferences);
        toast({
          title: "Preferencias actualizadas",
          description: "Tus preferencias se han guardado correctamente"
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias",
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
