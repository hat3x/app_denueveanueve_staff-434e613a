import { useAuth } from '@/lib/auth';

type AppRole = 'admin' | 'manager' | 'staff' | 'customer';

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
