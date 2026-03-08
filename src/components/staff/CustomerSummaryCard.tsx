import { User, Star, TrendingUp, Clock, Gift, AlertTriangle } from 'lucide-react';

interface CustomerSummaryCardProps {
  customer: {
    first_name: string;
    last_name: string;
    phone: string;
    status: string;
    loyalty?: { visits_total: number; points_balance: number; last_visit_at: string | null };
    rewards_available: number;
  };
}

function maskPhone(phone: string) {
  if (phone.length < 4) return '****';
  return '•••• •••• ' + phone.slice(-4);
}

function formatDate(d: string | null) {
  if (!d) return 'Nunca';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CustomerSummaryCard({ customer }: CustomerSummaryCardProps) {
  const isInactive = customer.status !== 'ACTIVE';

  return (
    <div className={`rounded-xl border p-4 ${isInactive ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'}`}>
      {isInactive && (
        <div className="mb-3 flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Cliente {customer.status === 'DISABLED' ? 'deshabilitado' : 'pendiente de verificación'}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-lg">{customer.first_name} {customer.last_name}</h3>
          <p className="text-sm text-muted-foreground">{maskPhone(customer.phone)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Star className="h-3.5 w-3.5" /> Visitas
          </div>
          <p className="text-lg font-bold text-foreground">{customer.loyalty?.visits_total ?? 0}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingUp className="h-3.5 w-3.5" /> Puntos
          </div>
          <p className="text-lg font-bold text-foreground">{customer.loyalty?.points_balance ?? 0}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" /> Última visita
          </div>
          <p className="text-sm font-medium text-foreground">{formatDate(customer.loyalty?.last_visit_at ?? null)}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Gift className="h-3.5 w-3.5" /> Recompensas
          </div>
          <p className="text-lg font-bold text-foreground">{customer.rewards_available}</p>
        </div>
      </div>
    </div>
  );
}
