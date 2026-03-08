import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { ErrorState } from '@/components/staff/ErrorState';
import { CustomerSummaryCard } from '@/components/staff/CustomerSummaryCard';
import { EmptyState } from '@/components/staff/EmptyState';
import { Button } from '@/components/ui/button';
import { ScanLine, Star, Clock, ArrowLeft } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!id) return;
      const [custRes, loyRes, rewRes, movRes] = await Promise.all([
        supabase.from('customers').select('*').eq('id', id).single(),
        supabase.from('loyalty_accounts').select('*').eq('customer_id', id).single(),
        supabase.from('rewards').select('id', { count: 'exact', head: true }).eq('customer_id', id).eq('status', 'AVAILABLE'),
        supabase.from('points_movements').select('*').eq('customer_id', id).order('created_at', { ascending: false }).limit(20),
      ]);

      if (custRes.error) {
        setError('Cliente no encontrado');
        setLoading(false);
        return;
      }

      setCustomer({
        ...custRes.data,
        loyalty: loyRes.data,
        rewards_available: rewRes.count ?? 0,
      });
      setMovements(movRes.data ?? []);
      setLoading(false);
    }
    fetch();
  }, [id]);

  if (loading) return <LoadingState message="Cargando perfil..." />;
  if (error || !customer) return <ErrorState message={error ?? 'No encontrado'} />;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="px-4 pt-6 pb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <CustomerSummaryCard customer={customer} />

      <div className="mt-4">
        <Button
          className="w-full h-12 staff-gradient text-primary-foreground font-semibold"
          onClick={() => navigate('/select-service', {
            state: {
              customerId: customer.id,
              customerName: `${customer.first_name} ${customer.last_name}`,
              qrToken: customer.qr_token,
              verificationMethod: 'MANUAL',
              loyalty: customer.loyalty,
            },
          })}
          disabled={customer.status === 'DISABLED'}
        >
          <ScanLine className="mr-2 h-5 w-5" />
          Acreditar visita
        </Button>
      </div>

      {/* Points history */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Historial de puntos
        </h3>
        {movements.length === 0 ? (
          <EmptyState title="Sin movimientos" message="Aún no hay movimientos de puntos" />
        ) : (
          <div className="space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${m.type === 'EARN' ? 'text-primary' : 'text-destructive'}`} />
                  <div>
                    <p className="text-sm text-foreground">{m.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
                  </div>
                </div>
                <span className={`font-bold ${m.type === 'EARN' ? 'text-primary' : 'text-destructive'}`}>
                  {m.type === 'EARN' ? '+' : '-'}{m.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
