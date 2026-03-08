import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
const STAFF_ROLES: AppRole[] = ['staff', 'manager', 'admin'];

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isStaff: boolean;
  isManager: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasStaffAccess: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    isStaff: false,
    isManager: false,
    isAdmin: false,
    loading: true,
    error: null,
  });

  const fetchRoles = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roles = (data?.map((r) => r.role) ?? []) as AppRole[];
    return roles;
  }, []);

  const updateState = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({
        user: null, session: null, roles: [],
        isStaff: false, isManager: false, isAdmin: false,
        loading: false, error: null,
      });
      return;
    }

    const roles = await fetchRoles(session.user.id);
    const hasStaff = roles.some((r) => STAFF_ROLES.includes(r));

    setState({
      user: session.user,
      session,
      roles,
      isStaff: roles.includes('staff') || roles.includes('manager') || roles.includes('admin'),
      isManager: roles.includes('manager') || roles.includes('admin'),
      isAdmin: roles.includes('admin'),
      loading: false,
      error: hasStaff ? null : 'No tienes permisos de staff',
    });
  }, [fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await updateState(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      updateState(session);
    });

    return () => subscription.unsubscribe();
  }, [updateState]);

  const signIn = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null, session: null, roles: [],
      isStaff: false, isManager: false, isAdmin: false,
      loading: false, error: null,
    });
  };

  const hasStaffAccess = state.roles.some((r) => STAFF_ROLES.includes(r));

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, hasStaffAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
