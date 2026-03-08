import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { ServiceSelector } from '@/components/staff/ServiceSelector';
import { Scissors } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string | null;
  fixed_points: number | null;
  base_price: number | null;
  duration_min: number | null;
}

export default function SelectService() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('services')
        .select('id, name, category, fixed_points, base_price, duration_min')
        .eq('active', true)
        .order('category')
        .order('name');
      setServices(data ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const handleSelect = (service: Service) => {
    navigate('/confirm-visit', {
      state: {
        ...state,
        serviceId: service.id,
        serviceName: service.name,
        servicePoints: service.fixed_points ?? 10,
      },
    });
  };

  if (loading) return <LoadingState message="Cargando servicios..." />;

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          Seleccionar servicio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cliente: <span className="font-medium text-foreground">{state?.customerName}</span>
        </p>
      </div>

      <ServiceSelector services={services} onSelect={handleSelect} />
    </div>
  );
}
