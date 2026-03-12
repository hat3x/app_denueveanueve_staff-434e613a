import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScheduleEntry, ScheduleEntryType } from '@/types/schedule';
import { isSpanishHoliday } from '@/lib/spanish-holidays';
import { cn } from '@/lib/utils';

interface ScheduleCalendarProps {
  entries: ScheduleEntry[];
  year: number;
  month: number; // 0-indexed
  onMonthChange: (year: number, month: number) => void;
  onDayClick?: (date: string, entries: ScheduleEntry[]) => void;
  selectedDate?: string | null;
  /** Dates selected but not yet saved — shown with outline style */
  pendingDates?: string[];
  /** Current editor mode — determines outline color for pending dates */
  editorMode?: ScheduleEntryType | null;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

type DayType = ScheduleEntryType | 'free' | null;

function getDayType(dateStr: string, entries: ScheduleEntry[]): { type: DayType; entry?: ScheduleEntry } {
  const holiday = isSpanishHoliday(dateStr);
  if (holiday) return { type: 'holiday' };

  const dayEntries = entries.filter((e) => e.date === dateStr);
  if (dayEntries.find((e) => e.entry_type === 'sick_leave')) return { type: 'sick_leave', entry: dayEntries.find((e) => e.entry_type === 'sick_leave') };
  if (dayEntries.find((e) => e.entry_type === 'vacation')) return { type: 'vacation', entry: dayEntries.find((e) => e.entry_type === 'vacation') };
  if (dayEntries.find((e) => e.entry_type === 'availability')) return { type: 'availability', entry: dayEntries.find((e) => e.entry_type === 'availability') };

  return { type: 'free' };
}

/** Filled background for confirmed entries */
const typeColors: Record<string, string> = {
  availability: 'bg-cal-available text-white',
  vacation: 'bg-cal-vacation text-white',
  sick_leave: 'bg-cal-sick text-white',
  holiday: 'bg-cal-holiday text-black',
};

/** Outline-only style for pending (unconfirmed) selections */
const pendingOutlineColors: Record<string, string> = {
  availability: 'ring-2 ring-cal-available text-cal-available font-semibold',
  vacation: 'ring-2 ring-cal-vacation text-cal-vacation font-semibold',
  sick_leave: 'ring-2 ring-cal-sick text-cal-sick font-semibold',
};

export function ScheduleCalendar({
  entries, year, month, onMonthChange, onDayClick, selectedDate,
  pendingDates = [], editorMode,
}: ScheduleCalendarProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const pendingSet = useMemo(() => new Set(pendingDates), [pendingDates]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const result: { dateStr: string; day: number; currentMonth: boolean }[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      result.push({
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        day: d.getDate(),
        currentMonth: false,
      });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ dateStr, day: d, currentMonth: true });
    }

    const remaining = 7 - (result.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        result.push({
          dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
          day: d.getDate(),
          currentMonth: false,
        });
      }
    }

    return result;
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) onMonthChange(year - 1, 11);
    else onMonthChange(year, month - 1);
  };

  const nextMonth = () => {
    if (month === 11) onMonthChange(year + 1, 0);
    else onMonthChange(year, month + 1);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {MONTHS[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-muted-foreground py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ dateStr, day, currentMonth }) => {
          const { type } = getDayType(dateStr, entries);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const isPending = currentMonth && pendingSet.has(dateStr);

          // Pending outline takes priority over confirmed fill for the visual
          const confirmedClass = currentMonth && type && type !== 'free' && !isPending ? typeColors[type] : '';
          const pendingClass = isPending && editorMode ? pendingOutlineColors[editorMode] ?? '' : '';

          return (
            <button
              key={dateStr}
              onClick={() => {
                if (currentMonth && onDayClick) {
                  onDayClick(dateStr, entries.filter((e) => e.date === dateStr));
                }
              }}
              disabled={!currentMonth}
              className={cn(
                'aspect-square flex items-center justify-center rounded-lg text-sm transition-all relative',
                !currentMonth && 'opacity-20 cursor-default',
                currentMonth && !confirmedClass && !pendingClass && 'text-foreground hover:bg-secondary',
                confirmedClass,
                pendingClass,
                isToday && !isPending && !confirmedClass && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                isSelected && !isPending && 'ring-2 ring-foreground ring-offset-1 ring-offset-background',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {[
          { label: 'Disponible', color: 'bg-cal-available' },
          { label: 'Vacaciones', color: 'bg-cal-vacation' },
          { label: 'Baja', color: 'bg-cal-sick' },
          { label: 'Festivo', color: 'bg-cal-holiday' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded', color)} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
