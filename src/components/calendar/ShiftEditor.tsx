import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ShiftRange } from '@/pages/AdminEmployeeCalendar';

interface ShiftEditorProps {
  shifts: ShiftRange[];
  setShifts: (shifts: ShiftRange[]) => void;
  splitShift: boolean;
  setSplitShift: (v: boolean) => void;
}

export function ShiftEditor({ shifts, setShifts, splitShift, setSplitShift }: ShiftEditorProps) {
  const updateShift = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...shifts];
    updated[index] = { ...updated[index], [field]: value };
    setShifts(updated);
  };

  const handleToggleSplit = (checked: boolean) => {
    setSplitShift(checked);
    if (checked && shifts.length < 2) {
      setShifts([
        { start: shifts[0]?.start || '09:00', end: '14:00' },
        { start: '16:00', end: shifts[0]?.end || '20:00' },
      ]);
    } else if (!checked) {
      setShifts([shifts[0]]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Split shift toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={splitShift} onCheckedChange={handleToggleSplit} />
        <Label className="text-sm text-muted-foreground">Turno partido</Label>
      </div>

      {/* Shift 1 */}
      <div>
        {splitShift && <p className="text-xs text-muted-foreground mb-1">Turno mañana</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Inicio</Label>
            <Input type="time" value={shifts[0]?.start || '09:00'} onChange={(e) => updateShift(0, 'start', e.target.value)} className="h-10 bg-secondary border-border" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Fin</Label>
            <Input type="time" value={shifts[0]?.end || '14:00'} onChange={(e) => updateShift(0, 'end', e.target.value)} className="h-10 bg-secondary border-border" />
          </div>
        </div>
      </div>

      {/* Shift 2 */}
      {splitShift && shifts[1] && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Turno tarde</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Inicio</Label>
              <Input type="time" value={shifts[1].start} onChange={(e) => updateShift(1, 'start', e.target.value)} className="h-10 bg-secondary border-border" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Fin</Label>
              <Input type="time" value={shifts[1].end} onChange={(e) => updateShift(1, 'end', e.target.value)} className="h-10 bg-secondary border-border" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
