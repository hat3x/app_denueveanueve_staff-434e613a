import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type AppRole = 'admin' | 'manager' | 'staff' | 'customer';
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
    user: null, session: null, roles: [],
    isStaff: false, isManager: false, isAdmin: false,
    loading: true, error: null,
  });

  const fetchRoles = useCallback(async (userId: string) => {
    console.log('[Auth] Fetching roles for user:', userId);

    try {
      const rolesPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Roles query timeout')), 4000);
      });

      const { data, error } = await Promise.race([rolesPromise, timeoutPromise]) as Awaited<typeof rolesPromise>;
      console.log('[Auth] Roles result:', { data, error });

      if (error) return [];
      return (data?.map((r) => r.role) ?? []) as AppRole[];
    } catch (err) {
      console.error('[Auth] Failed fetching roles:', err);
      return [];
    }
  }, []);

  const updateState = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setState({ user: null, session: null, roles: [], isStaff: false, isManager: false, isAdmin: false, loading: false, error: null });
      return;
    }

    const roles = await fetchRoles(session.user.id);
    const hasStaff = roles.some((r) => STAFF_ROLES.includes(r));
    setState({
      user: session.user, session, roles,
      isStaff: hasStaff,
      isManager: roles.includes('manager') || roles.includes('admin'),
      isAdmin: roles.includes('admin'),
      loading: false,
      error: hasStaff ? null : 'No tienes permisos de staff',
    });
  }, [fetchRoles]);

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout - if auth check takes too long, stop loading
    const timeout = setTimeout(() => {
      if (mounted) {
        setState((s) => s.loading ? { ...s, loading: false } : s);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => { 
        if (mounted) await updateState(session); 
      }
    );
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) updateState(session);
    }).catch(() => {
      if (mounted) setState((s) => ({ ...s, loading: false, error: 'Error de conexión' }));
    });

    return () => { 
      mounted = false; 
      clearTimeout(timeout);
      subscription.unsubscribe(); 
    };
  }, [updateState]);

  const signIn = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const authPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado al iniciar sesión')), 8000);
      });

      const { error } = await Promise.race([authPromise, timeoutPromise]) as Awaited<typeof authPromise>;

      if (error) {
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      const message = err?.message || 'Error al iniciar sesión';
      setState((s) => ({ ...s, loading: false, error: message }));
      return { error: message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, roles: [], isStaff: false, isManager: false, isAdmin: false, loading: false, error: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, hasStaffAccess: state.roles.some((r) => STAFF_ROLES.includes(r)) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
