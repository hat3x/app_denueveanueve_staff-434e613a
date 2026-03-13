import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, MapPin, User, Scissors, Star, TrendingUp, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface LocationOption {
  id: string;
  name: string;
}

const MILESTONE_MAP: Record<number, string> = {
  3: 'Diagnóstico capilar',
  5: 'Tratamiento express',
  8: 'Vale producto',
  10: 'Pack premium',
};

export default function ConfirmVisit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const state = location.state as any;

  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentVisits = state?.loyalty?.visits_total ?? 0;
  const newVisits = currentVisits + 1;
  const pointsToAdd = state?.servicePoints ?? 10;
  const possibleReward = MILESTONE_MAP[newVisits] ?? null;

  useEffect(() => {
    supabase.from('locations').select('id, name').then(({ data }) => {
      setLocations(data ?? []);
      if (data && data.length > 0) setSelectedLocation(data[0].id);
    });
  }, []);

  const handleConfirm = async () => {
    if (!selectedLocation) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('verify-visit', {
        body: {
          qr_token: state.qrToken,
          location_id: selectedLocation,
          service_id: state.serviceId,
          appointment_id: state.appointmentId ?? undefined,
          service_prices: (state.services ?? []).map((s: any) => ({
            service_id: s.id,
            points: s.points ?? 10,
          })),
          verification_method: state.verificationMethod,
          notes,
        },
      });

      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);

      navigate('/visit-result', {
        replace: true,
        state: {
          success: true,
          customerName: state.customerName,
          serviceName: state.serviceName,
          pointsAdded: data.points_added ?? pointsToAdd,
          visitsTotal: data.visits_total ?? newVisits,
          pointsBalance: data.points_balance,
          unlockedReward: data.unlocked_reward,
          premium: data.premium ?? null,
          locationId: selectedLocation,
          hasActiveCoupon: data.has_active_coupon ?? false,
          couponRedeemed: data.coupon_redeemed ?? false,
          // Params for potential second call (coupon redeem)
          retryParams: {
            qr_token: state.qrToken,
            location_id: selectedLocation,
            service_prices: (state.services ?? []).map((s: any) => ({
              service_name: s.name,
              final_price: s.points ?? 10,
            })),
          },
        },
      });
    } catch (err: any) {
      setError(err.message || 'Error al acreditar la visita');
      setSubmitting(false);
    }
  };

  const verificationLabels: Record<string, string> = {
    QR_PHONE: 'Teléfono (últimos 4 dígitos)',
    QR_PIN: 'PIN de cliente',
  };

  return (
    <div className="px-4 pt-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Confirmar visita
        </h1>
      </div>

      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        {/* Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{state?.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Servicio{(state?.services?.length ?? 0) > 1 ? 's' : ''}</p>
              {state?.services ? (
                <ul className="space-y-0.5">
                  {state.services.map((s: any) => (
                    <li key={s.id} className="font-medium text-foreground text-sm">
                      {s.name} <span className="text-xs text-muted-foreground">({s.points} pts)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-medium text-foreground">{state?.serviceName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Verificación</p>
              <p className="font-medium text-foreground">{verificationLabels[state?.verificationMethod] ?? state?.verificationMethod}</p>
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Points preview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <Star className="mx-auto h-4 w-4 text-primary mb-1" />
            <p className="text-lg font-bold text-primary">+{pointsToAdd}</p>
            <p className="text-xs text-muted-foreground">Puntos</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-accent mb-1" />
            <p className="text-lg font-bold text-foreground">{newVisits}</p>
            <p className="text-xs text-muted-foreground">Visitas totales</p>
          </div>
        </div>

        {possibleReward && (
          <div className="rounded-lg bg-primary/10 p-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-primary">¡Recompensa desbloqueada!</p>
              <p className="text-xs text-muted-foreground">{possibleReward}</p>
            </div>
          </div>
        )}

        <hr className="border-border" />

        {/* Location */}
        <div>
          <Label className="text-foreground text-sm flex items-center gap-1 mb-2">
            <MapPin className="h-4 w-4" /> Ubicación
          </Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="bg-muted border-border text-foreground">
              <SelectValue placeholder="Seleccionar ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-foreground text-sm mb-2 block">Notas (opcional)</Label>
          <Textarea
            placeholder="Añadir notas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-muted border-border text-foreground resize-none"
            rows={2}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={submitting || !selectedLocation}
          className="w-full h-14 gradient-gold text-primary-foreground font-semibold text-base shadow-gold"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Acreditar visita'}
        </Button>
      </div>
    </div>
  );
}
