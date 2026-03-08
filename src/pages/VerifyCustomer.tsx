import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { ErrorState } from '@/components/staff/ErrorState';
import { CustomerSummaryCard } from '@/components/staff/CustomerSummaryCard';
import { IdentityVerificationForm } from '@/components/staff/IdentityVerificationForm';
import { UserCheck } from 'lucide-react';

interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  loyalty?: { visits_total: number; points_balance: number; last_visit_at: string | null };
  rewards_available: number;
}

export default function VerifyCustomer() {
  const location = useLocation();
  const navigate = useNavigate();
  const qrToken = (location.state as any)?.qrToken;
  const customerId = (location.state as any)?.customerId;
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<string>('');

  useEffect(() => {
    async function fetchCustomer() {
      let query = supabase.from('customers').select('id, first_name, last_name, phone, status');

      if (qrToken) {
        query = query.eq('qr_token', qrToken);
      } else if (customerId) {
        query = query.eq('id', customerId);
      } else {
        setError('No se proporcionó token QR ni cliente');
        setLoading(false);
        return;
      }

      const { data: cust, error: custErr } = await query.single();
      if (custErr || !cust) {
        setError('Cliente no encontrado');
        setLoading(false);
        return;
      }

      if (cust.status === 'DISABLED') {
        setError('Esta cuenta de cliente está deshabilitada');
        setLoading(false);
        return;
      }

      const [loyaltyRes, rewardsRes] = await Promise.all([
        supabase.from('loyalty_accounts').select('*').eq('customer_id', cust.id).single(),
        supabase.from('rewards').select('id', { count: 'exact', head: true })
          .eq('customer_id', cust.id).eq('status', 'AVAILABLE'),
      ]);

      setCustomer({
        ...cust,
        loyalty: loyaltyRes.data ?? undefined,
        rewards_available: rewardsRes.count ?? 0,
      });
      setLoading(false);
    }
    fetchCustomer();
  }, [qrToken, customerId]);

  const handleVerified = (method: string) => {
    setVerified(true);
    setVerificationMethod(method);
    navigate('/select-service', {
      state: {
        customerId: customer!.id,
        customerName: `${customer!.first_name} ${customer!.last_name}`,
        qrToken,
        verificationMethod: method,
        loyalty: customer!.loyalty,
      },
    });
  };

  if (loading) return <LoadingState message="Buscando cliente..." />;
  if (error) return <ErrorState title="Error" message={error} onRetry={() => navigate('/scan')} />;
  if (!customer) return <ErrorState message="Cliente no encontrado" />;

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Verificar cliente
        </h1>
      </div>

      <CustomerSummaryCard customer={customer} />

      {!verified && (
        <div className="mt-6">
          <IdentityVerificationForm
            customerId={customer.id}
            onVerified={handleVerified}
          />
        </div>
      )}
    </div>
  );
}
