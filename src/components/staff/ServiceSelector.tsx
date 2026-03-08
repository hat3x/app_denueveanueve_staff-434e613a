import { useState } from 'react';
import { Star, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from './EmptyState';

interface Service {
  id: string;
  name: string;
  category: string | null;
  fixed_points: number | null;
  base_price: number | null;
  duration_min: number | null;
}

interface ServiceSelectorProps {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceSelector({ services, onSelect }: ServiceSelectorProps) {
  const [search, setSearch] = useState('');

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const grouped = filtered.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div>
      <Input
        placeholder="Buscar servicio..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 h-11 bg-card border-border text-foreground placeholder:text-muted-foreground"
      />

      {Object.keys(grouped).length === 0 ? (
        <EmptyState title="Sin servicios" message="No se encontraron servicios" />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{category}</h3>
              <div className="space-y-2">
                {items.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onSelect(service)}
                    className="flex w-full items-center justify-between rounded-xl bg-card border border-border p-4 text-left transition-all hover:bg-secondary active:scale-[0.98]"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{service.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-primary" />
                          {service.fixed_points ?? 10} pts
                        </span>
                        {service.duration_min && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration_min} min
                          </span>
                        )}
                        {service.base_price != null && (
                          <span>{service.base_price.toFixed(2)}€</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
