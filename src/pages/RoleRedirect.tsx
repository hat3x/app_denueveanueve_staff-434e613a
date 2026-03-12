import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { LoadingState } from '@/components/staff/LoadingState';

/**
 * Redirects user based on their role:
 * - admin → /admin/employees
 * - staff (with staff_member link) → /employee/calendar
 * - staff (common, no link) → /dashboard
 * - no user → /login
 */
export default function RoleRedirect() {
  const { user, loading, isAdmin, isStaff, roles } = useAuth();

  if (loading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;

  // Admin gets admin panel
  if (isAdmin) return <Navigate to="/admin/employees" replace />;

  // Staff/manager without admin → employee calendar (they can also access /dashboard)
  if (isStaff) return <Navigate to="/employee/calendar" replace />;

  // Fallback
  return <Navigate to="/dashboard" replace />;
}
