import { useState } from 'react';
import { Star, Clock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  onSelect: (services: Service[]) => void;
}

export function ServiceSelector({ services, onSelect }: ServiceSelectorProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Map<string, Service>>(new Map());

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

  const toggleService = (service: Service) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(service.id)) {
        next.delete(service.id);
      } else {
        next.set(service.id, service);
      }
      return next;
    });
  };

  const totalPoints = Array.from(selected.values()).reduce(
    (sum, s) => sum + (s.fixed_points ?? 10),
    0
  );

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
                {items.map((service) => {
                  const isSelected = selected.has(service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:bg-secondary'
                      }`}
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
                      <div className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky confirm bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 rounded-xl bg-card border border-border p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              {selected.size} servicio{selected.size > 1 ? 's' : ''} · <span className="font-semibold text-primary">{totalPoints} pts</span>
            </p>
          </div>
          <Button
            onClick={() => onSelect(Array.from(selected.values()))}
            className="w-full h-12 gradient-gold text-primary-foreground font-semibold shadow-gold"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
