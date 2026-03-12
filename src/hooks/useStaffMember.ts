import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import type { StaffMember } from '@/types/schedule';

export function useStaffMember() {
  const { user } = useAuth();
  const [staffMember, setStaffMember] = useState<StaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    supabase
      .from('staff_members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setStaffMember(data as StaffMember | null);
        setLoading(false);
      });
  }, [user]);

  return { staffMember, loading };
}
