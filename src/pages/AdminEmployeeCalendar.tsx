import { useEffect, useState } from 'react';
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
import { ShiftEditor } from '@/components/calendar/ShiftEditor';
import { DayDetailPanel } from '@/components/calendar/DayDetailPanel';

type EditorMode = 'availability' | 'vacation' | 'sick_leave' | null;

export interface ShiftRange {
  start: string;
  end: string;
}

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

  // Editor state — all modes now use multi-day selection
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [multiDayDates, setMultiDayDates] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Shift times (for availability)
  const [shifts, setShifts] = useState<ShiftRange[]>([{ start: '09:00', end: '14:00' }]);
  const [splitShift, setSplitShift] = useState(false);

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
    if (editorMode) {
      // Toggle date in multi-day selection for all modes
      setMultiDayDates((prev) =>
        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
      );
      return;
    }
    setSelectedDate(date);
    setSelectedEntries(dayEntries);
  };

  const handleSaveAvailability = async () => {
    if (!id || !user || multiDayDates.length === 0) return;
    setSaving(true);

    const activeShifts = splitShift ? shifts : [shifts[0]];

    for (const date of multiDayDates) {
      // Remove existing availability for these dates
      await supabase
        .from('employee_schedules')
        .delete()
        .eq('staff_member_id', id)
        .eq('date', date)
        .eq('entry_type', 'availability');
    }

    // Insert one row per shift per date
    const rows = multiDayDates.flatMap((date) =>
      activeShifts.map((shift) => ({
        staff_member_id: id,
        date,
        entry_type: 'availability' as const,
        start_time: shift.start,
        end_time: shift.end,
        created_by: user.id,
      }))
    );

    const { error } = await supabase.from('employee_schedules').insert(rows);
    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Guardado', description: `Horario actualizado para ${multiDayDates.length} día(s)` });
      setEditorMode(null);
      setMultiDayDates([]);
      refetch();
    }
  };

  const handleSaveMultiDay = async () => {
    if (!id || !user || !editorMode || multiDayDates.length === 0) return;

    if (editorMode === 'availability') {
      return handleSaveAvailability();
    }

    setSaving(true);

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

  const resetEditor = () => {
    setEditorMode(null);
    setMultiDayDates([]);
    setSplitShift(false);
    setShifts([{ start: '09:00', end: '14:00' }]);
  };

  if (loading) return <LoadingState message="Cargando empleado..." />;
  if (!member) return <div className="p-6 text-center text-muted-foreground">Empleado no encontrado</div>;

  const modeConfig = [
    { mode: 'availability' as const, label: 'Horario', color: 'bg-cal-available' },
    { mode: 'vacation' as const, label: 'Vacaciones', color: 'bg-cal-vacation' },
    { mode: 'sick_leave' as const, label: 'Baja', color: 'bg-cal-sick' },
  ];

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
        {modeConfig.map(({ mode, label, color }) => (
          <Button
            key={mode}
            variant={editorMode === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (editorMode === mode) resetEditor();
              else {
                resetEditor();
                setEditorMode(mode);
              }
            }}
            className={cn('flex-shrink-0', editorMode === mode && color + ' text-white border-0')}
          >
            <Plus className="h-4 w-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Editor panel for all modes */}
      {editorMode && (
        <div className="mb-4 rounded-xl bg-card border border-border p-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Toca los días en el calendario para{' '}
            {editorMode === 'availability' ? 'asignar horario' : editorMode === 'vacation' ? 'marcar vacaciones' : 'marcar baja'}.
            <span className="text-foreground font-medium"> {multiDayDates.length} día(s) seleccionado(s)</span>
          </p>

          {/* Shift time editor for availability */}
          {editorMode === 'availability' && (
            <ShiftEditor
              shifts={shifts}
              setShifts={setShifts}
              splitShift={splitShift}
              setSplitShift={setSplitShift}
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={multiDayDates.length === 0 || saving}
              onClick={handleSaveMultiDay}
              className={cn(
                editorMode === 'availability' && 'bg-cal-available hover:bg-cal-available/90',
                editorMode === 'vacation' && 'bg-cal-vacation hover:bg-cal-vacation/90',
                editorMode === 'sick_leave' && 'bg-cal-sick hover:bg-cal-sick/90',
                'text-white'
              )}
            >
              {saving ? 'Guardando...' : 'Confirmar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetEditor}>
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
          selectedDate={editorMode ? null : selectedDate}
          pendingDates={multiDayDates}
          editorMode={editorMode}
        />
      </div>

      {/* Day detail panel (only when no editor mode) */}
      {selectedDate && !editorMode && (
        <DayDetailPanel
          selectedDate={selectedDate}
          selectedEntries={selectedEntries}
          onClose={() => setSelectedDate(null)}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
    </div>
  );
}
