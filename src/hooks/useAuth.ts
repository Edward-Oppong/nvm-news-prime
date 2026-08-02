import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  });

  const checkAdminStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      setAuthState(prev => ({
        ...prev,
        isAdmin: !!data && !error,
        loading: false,
      }));
    } catch {
      setAuthState(prev => ({ ...prev, isAdmin: false, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          if (event === 'TOKEN_REFRESHED') {
            // Silently update session & user without re-checking the role or
            // showing the loading spinner — this prevents the "refresh loop"
            // that appears every time Supabase auto-refreshes the JWT.
            setAuthState(prev => ({
              ...prev,
              session,
              user: session.user,
              // loading stays false; isAdmin is preserved
            }));
          } else {
            // INITIAL_SESSION or SIGNED_IN — need to (re-)verify the role.
            // Keep loading=true to block protected routes until we know.
            setAuthState(prev => ({
              ...prev,
              session,
              user: session.user,
              // Preserve isAdmin for the SAME user (avoids flicker on re-mount)
              isAdmin: prev.user?.id === session.user.id ? prev.isAdmin : false,
              loading: true,
            }));
            // setTimeout avoids a Supabase deadlock when querying the DB
            // from inside the onAuthStateChange callback.
            setTimeout(() => {
              checkAdminStatus(session.user.id);
            }, 0);
          }
        } else {
          // SIGNED_OUT — clear everything immediately
          setAuthState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    ...authState,
    isWriter: !!authState.user && !authState.isAdmin,
    signIn,
    signUp,
    signOut,
  };
}
