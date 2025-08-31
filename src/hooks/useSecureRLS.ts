
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContext {
  isAuthenticated: boolean;
  userId: string | null;
  userRole: string | null;
  permissions: string[];
}

export const useSecureRLS = () => {
  const [securityContext, setSecurityContext] = useState<SecurityContext>({
    isAuthenticated: false,
    userId: null,
    userRole: null,
    permissions: []
  });

  useEffect(() => {
    const updateSecurityContext = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user role securely
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          setSecurityContext({
            isAuthenticated: true,
            userId: session.user.id,
            userRole: roleData?.role || 'user',
            permissions: [] // This would be populated based on role
          });
        } else {
          setSecurityContext({
            isAuthenticated: false,
            userId: null,
            userRole: null,
            permissions: []
          });
        }
      } catch (error) {
        console.error('Error updating security context:', error);
        setSecurityContext({
          isAuthenticated: false,
          userId: null,
          userRole: null,
          permissions: []
        });
      }
    };

    updateSecurityContext();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      updateSecurityContext();
    });

    return () => subscription.unsubscribe();
  }, []);

  return securityContext;
};
