import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useScheduleEntries } from '@/hooks/useScheduleEntries';
import { ScheduleCalendar } from '@/components/calendar/ScheduleCalendar';
import { LoadingState } from '@/components/staff/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Clock, Calendar, X } from 'lucide-react';
import type { StaffMember, ScheduleEntry, ScheduleEntryType } from '@/types/schedule';
import { isSpanishHoliday } from '@/lib/spanish-holidays';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type EditorMode = 'availability' | 'vacation' | 'sick_leave' | null;

export default function AdminEmployeeCalendar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<ScheduleEntry[]>([]);

  // Editor state
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [saving, setSaving] = useState(false);

  // Multi-day selection for vacation/sick
  const [multiDayDates, setMultiDayDates] = useState<string[]>([]);

  const { entries, loading: entriesLoading, refetch } = useScheduleEntries(id, year, month);

  useEffect(() => {
    if (!id) return;
    supabase.from('staff_members').select('*').eq('id', id).single()
      .then(({ data }) => {
        setMember(data as StaffMember | null);
        setLoading(false);
      });
  }, [id]);

  const handleDayClick = (date: string, dayEntries: ScheduleEntry[]) => {
    if (editorMode === 'vacation' || editorMode === 'sick_leave') {
      // Toggle date in multi-day selection
      setMultiDayDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
      );
      return;
    }
    setSelectedDate(date);
    setSelectedEntries(dayEntries);
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate || !id || !user) return;
    setSaving(true);

    // Remove existing availability for this date
    await supabase
      .from('employee_schedules')
      .delete()
      .eq('staff_member_id', id)
      .eq('date', selectedDate)
      .eq('entry_type', 'availability');

    const { error } = await supabase.from('employee_schedules').insert({
      staff_member_id: id,
      date: selectedDate,
      entry_type: 'availability',
      start_time: startTime,
      end_time: endTime,
      created_by: user.id,
    });

    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Guardado', description: 'Horario actualizado' });
      setEditorMode(null);
      refetch();
    }
  };

  const handleSaveMultiDay = async () => {
    if (!id || !user || !editorMode || multiDayDates.length === 0) return;
    setSaving(true);

    // Remove existing entries of same type for these dates
    for (const date of multiDayDates) {
      await supabase
        .from('employee_schedules')
        .delete()
        .eq('staff_member_id', id)
        .eq('date', date)
        .eq('entry_type', editorMode);
    }

    const rows = multiDayDates.map((date) => ({
      staff_member_id: id,
      date,
      entry_type: editorMode,
      created_by: user.id,
    }));

    const { error } = await supabase.from('employee_schedules').insert(rows);

    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const label = editorMode === 'vacation' ? 'Vacaciones' : 'Baja';
      toast({ title: 'Guardado', description: `${label} registrada para ${multiDayDates.length} día(s)` });
      setEditorMode(null);
      setMultiDayDates([]);
      refetch();
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    const { error } = await supabase.from('employee_schedules').delete().eq('id', entryId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Eliminado' });
      setSelectedEntries((prev) => prev.filter((e) => e.id !== entryId));
      refetch();
    }
  };

  if (loading) return <LoadingState message="Cargando empleado..." />;
  if (!member) return <div className="p-6 text-center text-muted-foreground">Empleado no encontrado</div>;

  const holiday = selectedDate ? isSpanishHoliday(selectedDate) : undefined;
  const typeLabels: Record<string, string> = {
    availability: 'Disponible',
    vacation: 'Vacaciones',
    sick_leave: 'Baja',
    holiday: 'Festivo',
  };

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/employees')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Calendario de</p>
          <h1 className="text-xl font-bold text-foreground">{member.name}</h1>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {([
          { mode: 'availability' as const, label: 'Horario', color: 'bg-cal-available' },
          { mode: 'vacation' as const, label: 'Vacaciones', color: 'bg-cal-vacation' },
          { mode: 'sick_leave' as const, label: 'Baja', color: 'bg-cal-sick' },
        ]).map(({ mode, label, color }) => (
          <Button
            key={mode}
            variant={editorMode === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setEditorMode(editorMode === mode ? null : mode);
              setMultiDayDates([]);
            }}
            className={cn('flex-shrink-0', editorMode === mode && color + ' text-white border-0')}
          >
            <Plus className="h-4 w-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Multi-day selection info */}
      {(editorMode === 'vacation' || editorMode === 'sick_leave') && (
        <div className="mb-4 rounded-xl bg-card border border-border p-3">
          <p className="text-sm text-muted-foreground mb-2">
            Toca los días en el calendario para {editorMode === 'vacation' ? 'marcar vacaciones' : 'marcar baja'}.
            <span className="text-foreground font-medium"> {multiDayDates.length} día(s) seleccionado(s)</span>
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={multiDayDates.length === 0 || saving}
              onClick={handleSaveMultiDay}
              className={cn(editorMode === 'vacation' ? 'bg-cal-vacation hover:bg-cal-vacation/90' : 'bg-cal-sick hover:bg-cal-sick/90', 'text-white')}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setEditorMode(null); setMultiDayDates([]); }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="rounded-xl bg-card border border-border p-4">
        <ScheduleCalendar
          entries={entries}
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m); setSelectedDate(null); setMultiDayDates([]); }}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />
      </div>

      {/* Day detail / editor */}
      {selectedDate && editorMode !== 'vacation' && editorMode !== 'sick_leave' && (
        <div className="mt-4 rounded-xl bg-card border border-border p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {holiday && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-cal-holiday/20">
              <Calendar className="h-4 w-4 text-cal-holiday" />
              <span className="text-sm font-medium text-cal-holiday">{holiday.name}</span>
            </div>
          )}

          {/* Existing entries */}
          {selectedEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {typeLabels[entry.entry_type]}
                </span>
                {entry.start_time && entry.end_time && (
                  <span className="text-sm text-muted-foreground">
                    {entry.start_time} – {entry.end_time}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Availability editor */}
          {editorMode === 'availability' && (
            <div className="mt-3 space-y-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Añadir horario disponible</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Hora inicio</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-10 bg-secondary border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Hora fin</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-10 bg-secondary border-border" />
                </div>
              </div>
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSaveAvailability}
                className="bg-cal-available hover:bg-cal-available/90 text-white"
              >
                {saving ? 'Guardando...' : 'Guardar horario'}
              </Button>
            </div>
          )}

          {/* Quick add if no mode */}
          {!editorMode && selectedEntries.length === 0 && !holiday && (
            <p className="text-sm text-muted-foreground">Día libre — usa los botones de arriba para añadir entradas.</p>
          )}
        </div>
      )}
    </div>
  );
}
