import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ScheduleEntry } from '@/types/schedule';

export function useScheduleEntries(staffMemberId: string | undefined, year: number, month: number) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!staffMemberId) { setLoading(false); return; }

    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0);
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    setLoading(true);
    const { data } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('staff_member_id', staffMemberId)
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date');

    setEntries((data as ScheduleEntry[] | null) ?? []);
    setLoading(false);
  }, [staffMemberId, year, month]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, refetch: fetch };
}
