import { useAuth } from '@/lib/auth';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleGateProps {
  allowed: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const { roles } = useAuth();
  const hasAccess = roles.some((r) => allowed.includes(r));
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
