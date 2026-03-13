import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Star, TrendingUp, Gift, User, Scissors, Ticket, Loader2 } from 'lucide-react';
import PremiumClubSection from '@/components/staff/PremiumClubSection';

export default function VisitResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

  const [redeemChecked, setRedeemChecked] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [couponRedeemed, setCouponRedeemed] = useState(state?.couponRedeemed ?? false);

  if (!state?.success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground">No hay resultado que mostrar</p>
          <Button variant="outline" className="mt-4 border-border text-foreground" onClick={() => navigate('/dashboard')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const hasPremium = state.premium?.is_premium === true;
  const showCouponOption = state.hasActiveCoupon && !couponRedeemed;

  const handleRedeemCoupon = async () => {
    if (!redeemChecked || !state.retryParams) return;
    setRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-visit', {
        body: {
          ...state.retryParams,
          redeem_coupon: true,
        },
      });
      if (error) throw error;
      if (data?.coupon_redeemed) {
        setCouponRedeemed(true);
      }
    } catch {
      // silently fail – coupon can be redeemed later
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-6 pb-28 pt-8">
      <div className="w-full max-w-sm text-center animate-slide-up">
        {/* Success icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 animate-check-bounce">
          <CheckCircle className="h-12 w-12 text-accent" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">¡Visita acreditada!</h1>
        <p className="text-muted-foreground text-sm mb-6">La visita se ha registrado correctamente</p>

        <div className="rounded-xl bg-card border border-border p-4 text-left space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground font-medium">{state.customerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{state.serviceName}</span>
          </div>
          <hr className="border-border" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <Star className="mx-auto h-4 w-4 text-primary mb-1" />
              <p className="text-xl font-bold text-primary">+{state.pointsAdded}</p>
              <p className="text-xs text-muted-foreground">Puntos</p>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <TrendingUp className="mx-auto h-4 w-4 text-accent mb-1" />
              <p className="text-xl font-bold text-foreground">{state.visitsTotal}</p>
              <p className="text-xs text-muted-foreground">Visitas</p>
            </div>
          </div>
          {state.unlockedReward && (
            <div className="rounded-lg bg-primary/10 p-3 flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-primary">¡Recompensa desbloqueada!</p>
                <p className="text-xs text-muted-foreground">{state.unlockedReward}</p>
              </div>
            </div>
          )}
        </div>

        {/* Coupon section */}
        {showCouponOption && (
          <div className="rounded-xl bg-card border border-border p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Cupón de bienvenida</p>
                <p className="text-xs text-muted-foreground">3€ de descuento disponible</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-3">
              <label htmlFor="redeem-coupon" className="text-sm text-foreground cursor-pointer">
                ¿Marcar como usado?
              </label>
              <Switch
                id="redeem-coupon"
                checked={redeemChecked}
                onCheckedChange={setRedeemChecked}
              />
            </div>
            {redeemChecked && (
              <Button
                onClick={handleRedeemCoupon}
                disabled={redeeming}
                className="w-full h-11 bg-primary text-primary-foreground font-semibold"
              >
                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar canje de cupón'}
              </Button>
            )}
          </div>
        )}

        {couponRedeemed && (
          <div className="rounded-xl bg-accent/10 border border-accent/20 p-4 mb-6 flex items-center gap-3">
            <Ticket className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-accent">Cupón canjeado</p>
              <p className="text-xs text-muted-foreground">3€ de descuento aplicado</p>
            </div>
          </div>
        )}

        {/* Club Premium section */}
        {hasPremium && (
          <PremiumClubSection
            premium={state.premium}
            locationId={state.locationId ?? ''}
          />
        )}

        <div className="space-y-3 mt-6">
          <Button
            onClick={() => navigate('/scan')}
            className="w-full h-12 gradient-gold text-primary-foreground font-semibold shadow-gold"
          >
            Escanear otro cliente
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 border-border text-foreground"
            onClick={() => navigate('/dashboard')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
