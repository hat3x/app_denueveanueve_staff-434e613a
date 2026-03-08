import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LoadingState } from '@/components/staff/LoadingState';
import { Shield } from 'lucide-react';

export function StaffRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, hasStaffAccess } = useAuth();

  if (loading) {
    return <LoadingState message="Verificando acceso..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasStaffAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-foreground">Acceso denegado</h1>
          <p className="text-muted-foreground text-sm">
            Tu cuenta no tiene permisos de staff. Contacta con un administrador.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
