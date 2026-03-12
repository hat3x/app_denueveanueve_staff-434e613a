import { Button } from '@/components/ui/button';
import { Clock, Calendar, Trash2, X } from 'lucide-react';
import { isSpanishHoliday } from '@/lib/spanish-holidays';
import type { ScheduleEntry } from '@/types/schedule';

interface DayDetailPanelProps {
  selectedDate: string;
  selectedEntries: ScheduleEntry[];
  onClose: () => void;
  onDeleteEntry: (id: string) => void;
}

const typeLabels: Record<string, string> = {
  availability: 'Disponible',
  vacation: 'Vacaciones',
  sick_leave: 'Baja',
  holiday: 'Festivo',
};

export function DayDetailPanel({ selectedDate, selectedEntries, onClose, onDeleteEntry }: DayDetailPanelProps) {
  const holiday = isSpanishHoliday(selectedDate);

  return (
    <div className="mt-4 rounded-xl bg-card border border-border p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {holiday && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-cal-holiday/20">
          <Calendar className="h-4 w-4 text-cal-holiday" />
          <span className="text-sm font-medium text-cal-holiday">{holiday.name}</span>
        </div>
      )}

      {selectedEntries.map((entry) => (
        <div key={entry.id} className="flex items-center justify-between gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {typeLabels[entry.entry_type]}
            </span>
            {entry.start_time && entry.end_time && (
              <span className="text-sm text-muted-foreground">
                {entry.start_time.substring(0, 5)} – {entry.end_time.substring(0, 5)}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteEntry(entry.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {selectedEntries.length === 0 && !holiday && (
        <p className="text-sm text-muted-foreground">Día libre — usa los botones de arriba para añadir entradas.</p>
      )}
    </div>
  );
}
