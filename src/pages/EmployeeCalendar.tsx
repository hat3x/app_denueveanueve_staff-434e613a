import { useState } from 'react';
import { useStaffMember } from '@/hooks/useStaffMember';
import { useScheduleEntries } from '@/hooks/useScheduleEntries';
import { ScheduleCalendar } from '@/components/calendar/ScheduleCalendar';
import { LoadingState } from '@/components/staff/LoadingState';
import { Calendar, Clock } from 'lucide-react';
import type { ScheduleEntry } from '@/types/schedule';
import { isSpanishHoliday } from '@/lib/spanish-holidays';

export default function EmployeeCalendar() {
  const { staffMember, loading: staffLoading } = useStaffMember();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<ScheduleEntry[]>([]);

  const { entries, loading: entriesLoading } = useScheduleEntries(staffMember?.id, year, month);

  if (staffLoading) return <LoadingState message="Cargando perfil..." />;

  if (!staffMember) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-foreground font-semibold">Sin perfil de empleado</p>
          <p className="text-sm text-muted-foreground mt-1">Tu cuenta no está vinculada a un empleado.</p>
        </div>
      </div>
    );
  }

  const handleDayClick = (date: string, dayEntries: ScheduleEntry[]) => {
    setSelectedDate(date);
    setSelectedEntries(dayEntries);
  };

  const holiday = selectedDate ? isSpanishHoliday(selectedDate) : undefined;

  const typeLabels: Record<string, string> = {
    availability: 'Disponible',
    vacation: 'Vacaciones',
    sick_leave: 'Baja',
    holiday: 'Festivo',
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Mi calendario</p>
        <h1 className="text-2xl font-bold text-foreground">{staffMember.name}</h1>
      </div>

      <div className="rounded-xl bg-card border border-border p-4">
        <ScheduleCalendar
          entries={entries}
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m); setSelectedDate(null); }}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>

      {/* Day detail */}
      {selectedDate && (
        <div className="mt-4 rounded-xl bg-card border border-border p-4 animate-slide-up">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {holiday && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-cal-holiday/20 text-cal-holiday">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{holiday.name}</span>
            </div>
          )}

          {selectedEntries.length === 0 && !holiday && (
            <p className="text-sm text-muted-foreground">Día libre — sin horario asignado</p>
          )}

          {selectedEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  {typeLabels[entry.entry_type] ?? entry.entry_type}
                </span>
                {entry.start_time && entry.end_time && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {entry.start_time} – {entry.end_time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
