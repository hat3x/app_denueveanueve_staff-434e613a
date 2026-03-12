import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/staff/LoadingState';
import { Users, MapPin, ChevronRight } from 'lucide-react';
import type { StaffMember } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  address: string;
}

export default function AdminEmployees() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [locRes, staffRes] = await Promise.all([
        supabase.from('locations').select('id, name, address').order('name'),
        supabase.from('staff_members').select('*').eq('active', true).order('name'),
      ]);
      setLocations((locRes.data as Location[] | null) ?? []);
      setStaff((staffRes.data as StaffMember[] | null) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingState message="Cargando empleados..." />;

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Administración</p>
        <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
      </div>

      {locations.map((loc) => {
        const locStaff = staff.filter((s) => s.location_id === loc.id);
        return (
          <div key={loc.id} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">{loc.name}</h2>
              <span className="text-xs text-muted-foreground">({locStaff.length})</span>
            </div>

            {locStaff.length === 0 ? (
              <p className="text-sm text-muted-foreground ml-6">Sin empleados en este establecimiento</p>
            ) : (
              <div className="space-y-2">
                {locStaff.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => navigate(`/admin/employees/${member.id}`)}
                    className="flex w-full items-center gap-3 rounded-xl bg-card border border-border p-4 text-left hover:bg-secondary transition-colors active:scale-[0.98]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.section.toLowerCase()}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
