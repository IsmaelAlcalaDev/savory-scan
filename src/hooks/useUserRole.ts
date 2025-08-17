
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'admin' | 'moderator' | 'user' | 'security_admin' | 'super_admin' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // First check if user has any roles assigned
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('role', { ascending: true }) // admin comes first
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No role found, assign default user role
            console.log('No role found for user, assigning default user role');
            try {
              const { error: insertError } = await supabase
                .from('user_roles')
                .insert({
                  user_id: user.id,
                  role: 'user'
                });
              
              if (insertError) {
                console.error('Error creating default user role:', insertError);
              }
              
              setRole('user');
            } catch (insertErr) {
              console.error('Error inserting default role:', insertErr);
              setRole('user');
            }
          } else {
            console.error('Error fetching user role:', error);
            setRole('user'); // Default to user role on error
          }
        } else {
          setRole(roleData?.role || 'user');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isModerator = role === 'moderator' || role === 'admin' || role === 'super_admin';
  const hasRole = (requiredRole: UserRole) => {
    if (!role) return false;
    if (requiredRole === 'user') return true;
    if (requiredRole === 'moderator') return role === 'moderator' || role === 'admin' || role === 'super_admin';
    if (requiredRole === 'admin') return role === 'admin' || role === 'super_admin';
    if (requiredRole === 'security_admin') return role === 'security_admin' || role === 'super_admin';
    if (requiredRole === 'super_admin') return role === 'super_admin';
    return false;
  };

  return {
    role,
    loading,
    isAdmin,
    isModerator,
    hasRole
  };
};
