import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Phone, KeyRound } from 'lucide-react';

interface IdentityVerificationFormProps {
  customerPhone: string;
  onVerified: (method: string, value?: string) => void;
}

type VerifyMethod = 'phone' | 'pin';

export function IdentityVerificationForm({ customerPhone, onVerified }: IdentityVerificationFormProps) {
  const [method, setMethod] = useState<VerifyMethod | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const lastDigits = customerPhone.slice(-4);

  const handleVerify = () => {
    setError(null);
    if (method === 'phone') {
      if (value === lastDigits) {
        onVerified('QR_PHONE', value);
      } else {
        setError('Los dígitos no coinciden');
      }
    } else if (method === 'pin') {
      if (value.length >= 4) {
        onVerified('QR_PIN', value);
      } else {
        setError('PIN mínimo 4 dígitos');
      }
    }
  };

  const methods = [
    { key: 'phone' as VerifyMethod, icon: Phone, label: 'Últimos 4 dígitos del teléfono' },
    { key: 'pin' as VerifyMethod, icon: KeyRound, label: 'PIN de cliente' },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Verificar identidad</h3>
      </div>

      {!method ? (
        <div className="space-y-2">
          {methods.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className="flex w-full items-center gap-3 rounded-lg bg-muted p-3 text-left transition-colors hover:bg-secondary active:scale-[0.98]"
            >
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 animate-slide-up">
          {method !== 'manual' && (
            <div>
              <Label className="text-foreground text-sm">
                {method === 'phone' ? 'Últimos 4 dígitos del teléfono' : 'PIN del cliente'}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={method === 'phone' ? 4 : 6}
                placeholder={method === 'phone' ? '• • • •' : '• • • • • •'}
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                className="mt-1 h-12 text-center text-xl tracking-[0.5em] bg-muted border-border text-foreground"
                autoFocus
              />
            </div>
          )}
          {method === 'manual' && (
            <p className="text-sm text-muted-foreground">
              Confirmas que has verificado la identidad del cliente de forma manual.
              Esta acción quedará registrada en auditoría.
            </p>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground"
              onClick={() => { setMethod(null); setValue(''); setError(null); }}
            >
              Atrás
            </Button>
            <Button
              className="flex-1 gradient-gold text-primary-foreground shadow-gold"
              onClick={handleVerify}
            >
              Verificar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
