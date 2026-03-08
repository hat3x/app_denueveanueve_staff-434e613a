import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { EmptyState } from '@/components/staff/EmptyState';
import { Input } from '@/components/ui/input';
import { Users, Search, ChevronRight, User } from 'lucide-react';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  status: string;
}

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('customers')
        .select('id, first_name, last_name, phone, email, status')
        .order('first_name');
      setCustomers(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-4 pt-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Clientes
        </h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {loading ? (
        <LoadingState message="Cargando clientes..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin resultados" message="No se encontraron clientes" />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="flex w-full items-center justify-between rounded-xl bg-card border border-border p-4 text-left transition-all hover:bg-secondary active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-muted-foreground">{c.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.status !== 'ACTIVE' && (
                  <span className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                    {c.status === 'DISABLED' ? 'Deshabilitado' : 'Pendiente'}
                  </span>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
