import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { EmptyState } from '@/components/staff/EmptyState';
import { Clock, Star, User, Scissors, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditEntry {
  id: string;
  action: string;
  actor_id: string | null;
  entity_id: string;
  metadata: any;
  created_at: string;
  location_id: string | null;
}

type FilterPeriod = 'today' | 'week' | 'all';

export default function History() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>('today');

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('action', 'VERIFY_VISIT')
        .order('created_at', { ascending: false })
        .limit(50);

      if (period === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      } else if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      }

      const { data } = await query;
      setEntries(data ?? []);
      setLoading(false);
    }
    fetch();
  }, [period]);

  const formatTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Historial
        </h1>
      </div>

      <div className="mb-4 flex gap-2">
        {([['today', 'Hoy'], ['week', '7 días'], ['all', 'Todo']] as const).map(([key, label]) => (
          <Button
            key={key}
            variant={period === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(key)}
            className={period === key ? 'gradient-gold text-primary-foreground shadow-gold' : 'border-border text-foreground'}
          >
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Cargando historial..." />
      ) : entries.length === 0 ? (
        <EmptyState title="Sin actividad" message="No hay visitas registradas en este período" />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl bg-card border border-border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {(entry.metadata as any)?.customer_name ?? 'Cliente'}
                    </span>
                  </div>
                  {(entry.metadata as any)?.service_name && (
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{(entry.metadata as any)?.service_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary font-medium">
                      +{(entry.metadata as any)?.points_added ?? 10} pts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · {(entry.metadata as any)?.visits_total ?? '?'} visitas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{formatTime(entry.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
