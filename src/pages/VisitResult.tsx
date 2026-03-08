import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star, TrendingUp, Gift, User, Scissors } from 'lucide-react';

export default function VisitResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;

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

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
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

        <div className="space-y-3">
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
